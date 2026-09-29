import { dodo, productIds } from '@/lib/billing';
import { supabaseAdmin } from '@/lib/supabase';
import { clerkClient } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!process.env.DODO_PAYMENTS_WEBHOOK_KEY) {
    return new Response('Webhook not configured', { status: 503 });
  }
  if (Number(request.headers.get('content-length') || 0) > 1_000_000) {
    return new Response('Payload too large', { status: 413 });
  }
  let event: any;
  try {
    const body = await request.text();
    if (body.length > 1_000_000) return new Response('Payload too large', { status: 413 });
    // Verify signature against the exact raw body BEFORE trusting any webhook data.
    event = dodo().webhooks.unwrap(body, {
      headers: Object.fromEntries(request.headers),
      key: process.env.DODO_PAYMENTS_WEBHOOK_KEY,
    });
  } catch (err) {
    console.warn('Dodo webhook signature verification error:', err);
    return new Response('Invalid signature or payload', { status: 400 });
  }

  const eventType = event.type || '';
  if (!eventType.startsWith('subscription.') && !eventType.startsWith('payment.')) {
    return new Response('Ignored event', { status: 200 });
  }

  const data = (event.data || {}) as Record<string, any>;
  const metadata = (data.metadata || {}) as Record<string, any>;
  const subscriptionId = data.subscription_id || data.payment_id || '';
  const customer = (data.customer || {}) as Record<string, any>;
  const eventId = request.headers.get('webhook-id') || `evt_${Date.now()}`;

  let userId = metadata?.clerk_user_id || metadata?.userId;

  // Determine plan and access
  const isProProduct = data.product_id === productIds().pro || data.product_id === process.env.NEXT_PUBLIC_DODO_PRO_PRODUCT_ID;
  const tier: 'pro' | 'starter' = isProProduct ? 'pro' : 'starter';

  const isAccessActive =
    ['active', 'renewed', 'succeeded'].includes(String(data.status || '')) ||
    eventType === 'payment.succeeded' ||
    eventType === 'subscription.active' ||
    eventType === 'subscription.renewed';

  try {
    if (userId) {
      // 1. Update Clerk user publicMetadata immediately
      try {
        const clerk = await clerkClient();
        await clerk.users.updateUserMetadata(userId, {
          publicMetadata: {
            membership: isAccessActive ? tier : 'free',
            is_pro: isAccessActive && tier === 'pro',
            has_billing_account: true,
            dodo_customer_id: customer?.customer_id || null,
            dodo_subscription_id: subscriptionId || null,
          },
        });
      } catch (clerkErr) {
        console.warn('Clerk metadata update notice in webhook:', clerkErr);
      }
    }

    // 2. Also try recording in dodo_subscriptions table if RPC exists in Supabase
    try {
      await supabaseAdmin.rpc('apply_dodo_subscription_event', {
        p_event_id: eventId,
        p_subscription_id: subscriptionId,
        p_user_id: userId || 'unknown',
        p_customer_id: customer?.customer_id || 'unknown',
        p_product_id: data.product_id || '',
        p_status: data.status || 'active',
        p_next_billing_date: typeof data.next_billing_date === 'string' ? data.next_billing_date : null,
        p_cancel_at_next_billing_date: data.cancel_at_next_billing_date === true,
        p_event_at: event.timestamp || new Date().toISOString(),
      });
    } catch {
      // Non-blocking fallback
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Dodo webhook processing notice:', error);
    return new Response('Webhook processed with notice', { status: 200 });
  }
}
