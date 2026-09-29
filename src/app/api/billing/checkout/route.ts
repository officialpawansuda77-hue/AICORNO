import { auth, currentUser } from '@clerk/nextjs/server';
import { configured, dodo, getSubscriptions, membershipFor, productIds, type Plan } from '@/lib/billing';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: 'Please sign in before subscribing.' }, { status: 401 });
  const origin = new URL(request.url).origin;
  if (request.headers.get('origin') !== origin) {
    return Response.json({ error: 'Invalid request origin.' }, { status: 403 });
  }
  let body: { plan?: unknown };
  try { body = await request.json(); } catch { return Response.json({ error: 'Invalid request.' }, { status: 400 }); }
  if (body.plan !== 'starter' && body.plan !== 'pro') {
    return Response.json({ error: 'Invalid plan.' }, { status: 400 });
  }
  const plan: Plan = body.plan;
  if (!configured()) return Response.json({ error: 'Checkout is not yet available. Please try again later.' }, { status: 503 });

  try {
    const rows = await getSubscriptions(userId);
    if (membershipFor(rows) !== 'free' || rows.some((row) => ['active', 'pending', 'past_due', 'on_hold', 'paused'].includes(row.status))) {
      return Response.json({ error: 'You already have a subscription. Manage it in the billing portal before changing plans.' }, { status: 409 });
    }
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) return Response.json({ error: 'Add an email to your account before subscribing.' }, { status: 400 });
    const productId = productIds()[plan];
    if (!productId) return Response.json({ error: 'This plan is not configured.' }, { status: 503 });
    const session = await dodo().checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: { email, name: user?.fullName || user?.firstName || email },
      metadata: { clerk_user_id: userId },
      return_url: `${origin}/checkout/success`,
      cancel_url: `${origin}/pricing`,
    });
    if (!session.checkout_url || !new URL(session.checkout_url).hostname.endsWith('.dodopayments.com') ||
        new URL(session.checkout_url).protocol !== 'https:') throw new Error('Unexpected checkout URL');
    return Response.json({ url: session.checkout_url });
  } catch (error) {
    console.error('Checkout failed:', error);
    return Response.json({ error: 'Checkout could not start. Please try again later.' }, { status: 503 });
  }
}
