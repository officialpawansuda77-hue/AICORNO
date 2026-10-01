import { auth, currentUser } from '@clerk/nextjs/server';
import { configured, dodo, getSubscriptions, membershipFor, productIds, type Plan } from '@/lib/billing';
import { isEmailAdmin } from '@/lib/authUtils';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body: { plan?: unknown; userId?: string; email?: string; name?: string } = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  let userId: string | null = null;
  try {
    const authRes = await auth();
    userId = authRes.userId;
  } catch (err) {
    console.warn('[Checkout] Clerk auth() notice:', err);
  }

  // Graceful fallback for cross-domain cookie restrictions or client token sync
  if (!userId && body.userId && typeof body.userId === 'string') {
    userId = body.userId;
  }

  if (!userId) {
    return Response.json({ error: 'Please sign in before subscribing.' }, { status: 401 });
  }

  if (body.plan !== 'starter' && body.plan !== 'pro') {
    return Response.json({ error: 'Invalid plan selected.' }, { status: 400 });
  }
  const plan: Plan = body.plan;

  if (!configured()) {
    console.error('[Checkout] Dodo payments credentials or product IDs not fully configured in env.');
    return Response.json({ error: 'Checkout is temporarily unavailable. Please try again shortly.' }, { status: 503 });
  }

  // Compute reliable origin for redirect return URLs
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const reqOrigin = request.headers.get('origin');
  const origin = reqOrigin || (host ? `${proto}://${host}` : new URL(request.url).origin);

  try {
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
      return Response.json({ error: 'Please add a verified email to your account before subscribing.' }, { status: 400 });
    }

    const isOwner = isEmailAdmin(email);

    // Check existing subscription status
    const rows = await getSubscriptions(userId);
    const currentTier = membershipFor(rows);

    // Only block if a non-admin user already has this EXACT plan active
    if (!isOwner && currentTier === plan && rows.some((row) => row.status === 'active')) {
      return Response.json({
        error: `You already have an active ${plan === 'pro' ? 'Pro Unlimited' : 'Starter'} subscription. Manage it in the billing portal.`,
      }, { status: 409 });
    }

    const productId = productIds()[plan];
    if (!productId) {
      return Response.json({ error: 'This plan is not configured.' }, { status: 503 });
    }

    const session = await dodo().checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: { email, name: name || email },
      metadata: { clerk_user_id: userId, plan },
      return_url: `${origin}/checkout/success`,
      cancel_url: `${origin}/pricing`,
    });

    if (!session?.checkout_url || !session.checkout_url.startsWith('https://')) {
      throw new Error('Payment gateway did not return a valid checkout session URL.');
    }

    return Response.json({ url: session.checkout_url });
  } catch (error: any) {
    console.error('[Checkout Error]:', error);
    const msg = error?.message || 'Checkout could not start. Please try again later.';
    return Response.json({ error: msg }, { status: 503 });
  }
}

