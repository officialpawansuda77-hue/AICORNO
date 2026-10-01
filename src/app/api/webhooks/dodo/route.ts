import { dodo, getSubscriptions, membershipFor } from '@/lib/billing';
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
  const eventId = request.headers.get('webhook-id');

  if (!eventId) {
    return new Response('Missing webhook-id', { status: 400 });
  }

  let userId = metadata?.clerk_user_id || metadata?.userId;

  try {
    // 1. Try applying event via Supabase RPC if table/function exists
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
    } catch (rpcErr) {
      console.warn('[Webhook] Supabase RPC notice (table may not be configured):', rpcErr);
    }

    // 2. Derive membership tier and update Clerk metadata directly
    if (userId) {
      try {
        const rows = await getSubscriptions(userId);
        let tier = membershipFor(rows);

        // If rows were empty (e.g. table not migrated), derive directly from product_id in event
        if (tier === 'free') {
          const ids = (await import('@/lib/membership')).productIds();
          const pId = data.product_id || (data.product_cart && data.product_cart[0]?.product_id);
          const status = (data.status || '').toLowerCase();
          const isActive = ['active', 'succeeded', 'paid', 'completed'].includes(status);

          if (isActive) {
            tier = pId === ids.starter ? 'starter' : 'pro';
          }
        }

        const clerk = await clerkClient();
        await clerk.users.updateUserMetadata(userId, {
          publicMetadata: {
            membership: tier,
            is_pro: tier === 'pro',
            has_billing_account: true,
            dodo_customer_id: customer?.customer_id || null,
            dodo_subscription_id: subscriptionId || null,
          },
        });
      } catch (clerkErr) {
        console.warn('Clerk metadata update notice in webhook:', clerkErr);
      }
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Dodo webhook processing error:', error);
    return new Response('Webhook processing failed', { status: 500 });
  }
}
