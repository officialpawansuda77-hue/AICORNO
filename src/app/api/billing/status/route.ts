import { auth, currentUser } from '@clerk/nextjs/server';
import { getSubscriptions, membershipFor } from '@/lib/billing';

export const runtime = 'nodejs';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: 'Sign in required.' }, { status: 401 });
  try {
    const rows = await getSubscriptions(userId);
    let tier = membershipFor(rows);
    let hasBillingAccount = rows.some((row) => Boolean(row.customer_id));

    // Also check Clerk user metadata
    const user = await currentUser();
    if (tier === 'free' && user?.publicMetadata?.membership) {
      tier = user.publicMetadata.membership as any;
      hasBillingAccount = Boolean(user.publicMetadata.has_billing_account);
    }

    return Response.json(
      { tier, hasBillingAccount },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (error) {
    console.error('Billing status error:', error);
    return Response.json({ tier: 'free', hasBillingAccount: false }, { headers: { 'Cache-Control': 'no-store' } });
  }
}
