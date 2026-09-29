import { auth, currentUser } from '@clerk/nextjs/server';
import { configured, dodo, getSubscriptions, membershipFor, productIds, type Plan } from '@/lib/billing';

export async function POST(request: Request) {
  let body: { plan?: unknown; userId?: string; email?: string; name?: string } = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }

  let userId: string | null = null;
  try {
    const authRes = await auth();
    userId = authRes.userId;
  } catch (err) {
    console.warn('Clerk auth() notice:', err);
  }

  // Graceful fallback for cross-domain cookie restrictions
  if (!userId && body.userId && typeof body.userId === 'string') {
    userId = body.userId;
  }

  if (!userId) {
    return Response.json({ error: 'Please sign in before subscribing.' }, { status: 401 });
  }

  const origin = new URL(request.url).origin;
  const reqOrigin = request.headers.get('origin');
  if (reqOrigin && reqOrigin !== origin) {
    try {
      const parsedReq = new URL(reqOrigin).hostname;
      const parsedApp = new URL(origin).hostname;
      if (parsedReq !== parsedApp && !parsedReq.endsWith('vercel.app')) {
        return Response.json({ error: 'Invalid request origin.' }, { status: 403 });
      }
    } catch {
      // allow
    }
  }

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

    let email = body.email;
    let name = body.name;

    try {
      const user = await currentUser();
      if (user?.primaryEmailAddress?.emailAddress) {
        email = user.primaryEmailAddress.emailAddress;
      }
      if (user?.fullName || user?.firstName) {
        name = user.fullName || user.firstName || name;
      }
    } catch {
      // currentUser may fail if Clerk secret is missing on server, fallback to client email/name
    }

    if (!email || typeof email !== 'string') {
      return Response.json({ error: 'Add an email to your account before subscribing.' }, { status: 400 });
    }

    const productId = productIds()[plan];
    if (!productId) return Response.json({ error: 'This plan is not configured.' }, { status: 503 });

    const session = await dodo().checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: { email, name: name || email },
      metadata: { clerk_user_id: userId },
      return_url: `${origin}/checkout/success`,
      cancel_url: `${origin}/pricing`,
    });

    if (!session.checkout_url || !new URL(session.checkout_url).hostname.endsWith('.dodopayments.com') ||
        new URL(session.checkout_url).protocol !== 'https:') throw new Error('Unexpected checkout URL');
    return Response.json({ url: session.checkout_url });
  } catch (error) {
    console.error('Checkout failed:', error);
    return Response.json({ error: error instanceof Error ? error.message : 'Checkout could not start. Please try again later.' }, { status: 503 });
  }
}

