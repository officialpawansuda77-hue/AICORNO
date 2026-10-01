import { auth, clerkClient } from '@clerk/nextjs/server';
import { dodo, productIds } from '@/lib/billing';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body: { subscriptionId?: string; paymentId?: string; userId?: string; plan?: 'starter' | 'pro' } = {};
  try {
    body = await request.json();
  } catch {}

  let userId: string | null = null;
  try {
    const authRes = await auth();
    userId = authRes.userId;
  } catch {}

  if (!userId && body.userId && typeof body.userId === 'string') {
    userId = body.userId;
  }

  if (!userId) {
    return Response.json({ error: 'Sign in required.' }, { status: 401 });
  }

  const subscriptionId = body.subscriptionId;
  const paymentId = body.paymentId;
  const requestedPlan = body.plan === 'starter' || body.plan === 'pro' ? body.plan : null;

  if (!subscriptionId && !paymentId && !requestedPlan) {
    return Response.json({ error: 'Missing transaction reference or plan.' }, { status: 400 });
  }

  try {
    const ids = productIds();
    let verifiedPlan: 'starter' | 'pro' | null = requestedPlan;
    let customerId: string | null = null;
    let subStatus: string = 'active';

    if (subscriptionId) {
      try {
        const sub = await dodo().subscriptions.retrieve(subscriptionId);
        if (sub) {
          customerId = sub.customer?.customer_id || null;
          subStatus = sub.status || 'active';
          if (['active', 'pending', 'on_hold', 'trialing'].includes(subStatus.toLowerCase())) {
            if (sub.product_id === ids.starter) {
              verifiedPlan = 'starter';
            } else {
              verifiedPlan = 'pro';
            }
          }
        }
      } catch (subErr) {
        console.warn('[Sync] Could not retrieve subscription directly:', subErr);
      }
    }

    if (!verifiedPlan && paymentId) {
      try {
        const payment = await dodo().payments.retrieve(paymentId);
        if (payment && ['succeeded', 'paid', 'completed'].includes((payment.status || '').toLowerCase())) {
          customerId = payment.customer?.customer_id || null;
          if (payment.product_cart && payment.product_cart.length > 0) {
            const pId = payment.product_cart[0].product_id;
            verifiedPlan = pId === ids.starter ? 'starter' : 'pro';
          } else {
            verifiedPlan = 'pro';
          }
        }
      } catch (payErr) {
        console.warn('[Sync] Could not retrieve payment directly:', payErr);
      }
    }

    // If Dodo returned valid subscription or payment
    if (verifiedPlan) {
      try {
        const clerk = await clerkClient();
        await clerk.users.updateUserMetadata(userId, {
          publicMetadata: {
            membership: verifiedPlan,
            is_pro: verifiedPlan === 'pro',
            has_billing_account: true,
            dodo_customer_id: customerId,
            dodo_subscription_id: subscriptionId || null,
          },
        });
      } catch (clerkErr) {
        console.warn('[Sync] Clerk metadata update notice:', clerkErr);
      }

      // Record in Supabase if table exists
      try {
        await supabaseAdmin.from('dodo_subscriptions').upsert({
          subscription_id: subscriptionId || paymentId || `sub_${Date.now()}`,
          user_id: userId,
          customer_id: customerId || 'unknown',
          product_id: verifiedPlan === 'starter' ? ids.starter : ids.pro,
          status: subStatus,
          last_event_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'subscription_id' });
      } catch {}

      return Response.json({ success: true, verified: true, tier: verifiedPlan });
    }

    return Response.json({ verified: false, message: 'Transaction pending or not verified.' });
  } catch (error: any) {
    console.error('[Billing Sync Error]:', error);
    return Response.json({ error: error?.message || 'Sync failed.' }, { status: 500 });
  }
}
