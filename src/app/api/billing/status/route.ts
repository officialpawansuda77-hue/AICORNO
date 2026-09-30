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
    // Check Clerk user metadata & email first
    let isClerkPro = false;
    let isOwner = false;
    try {
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.getUser(userId);
      const email = clerkUser.primaryEmailAddress?.emailAddress || '';
      isOwner = isEmailAdmin(email);
      isClerkPro = isOwner || clerkUser.publicMetadata?.membership === 'pro' || Boolean(clerkUser.publicMetadata?.is_pro);
    } catch {}

    if (isOwner || isClerkPro) {
      return Response.json(
        { tier: 'pro', hasBillingAccount: true },
        { headers: { 'Cache-Control': 'private, no-store' } }
      );
    }

    const rows = await getSubscriptions(userId);
    const tier = membershipFor(rows);
    const hasBillingAccount = rows.some((row) => Boolean(row.customer_id));

    return Response.json(
      { tier, hasBillingAccount },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (error) {
    console.error('Billing status error:', error);
    return Response.json({ tier: 'free', hasBillingAccount: false }, { headers: { 'Cache-Control': 'no-store' } });
  }
}
