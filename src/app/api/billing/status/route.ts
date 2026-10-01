import { auth, clerkClient } from '@clerk/nextjs/server';
import { getSubscriptions, membershipFor } from '@/lib/billing';
import { isEmailAdmin } from '@/lib/authUtils';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  let userId: string | null = null;
  try {
    const authRes = await auth();
    userId = authRes.userId;
  } catch {}

  if (!userId) {
    const url = new URL(request.url);
    userId = url.searchParams.get('userId');
  }

  if (!userId) return Response.json({ error: 'Sign in required.' }, { status: 401 });
  try {
    let isClerkPro = false;
    let isClerkStarter = false;
    let isOwner = false;
    let hasBillingAccount = false;

    try {
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.getUser(userId);
      const email = clerkUser.primaryEmailAddress?.emailAddress || '';
      isOwner = isEmailAdmin(email);
      const meta = (clerkUser.publicMetadata || {}) as Record<string, any>;
      const membershipStr = String(meta.membership || '').toLowerCase().trim();
      isClerkPro = isOwner || meta.role === 'admin' || membershipStr === 'pro' || Boolean(meta.is_pro);
      isClerkStarter = !isClerkPro && membershipStr === 'starter';
      hasBillingAccount = Boolean(meta.has_billing_account || meta.dodo_customer_id || meta.dodo_subscription_id || isClerkPro || isClerkStarter);
    } catch (err) {
      console.warn('[Status] Clerk getUser notice:', err);
    }

    if (isOwner || isClerkPro) {
      return Response.json(
        { tier: 'pro', hasBillingAccount: true },
        { headers: { 'Cache-Control': 'private, no-store' } }
      );
    }

    if (isClerkStarter) {
      return Response.json(
        { tier: 'starter', hasBillingAccount: true },
        { headers: { 'Cache-Control': 'private, no-store' } }
      );
    }

    const rows = await getSubscriptions(userId);
    const tier = membershipFor(rows);
    const hasBilling = hasBillingAccount || rows.some((row) => Boolean(row.customer_id));

    return Response.json(
      { tier, hasBillingAccount: hasBilling },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (error) {
    console.error('Billing status error:', error);
    return Response.json({ tier: 'free', hasBillingAccount: false }, { headers: { 'Cache-Control': 'no-store' } });
  }
}
