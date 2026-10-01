import { auth, clerkClient } from '@clerk/nextjs/server';
import { dodo, getSubscriptions } from '@/lib/billing';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body: { userId?: string } = {};
  try { body = await request.json(); } catch {}

  let userId: string | null = null;
  try {
    const authRes = await auth();
    userId = authRes.userId;
  } catch {}

  if (!userId && body.userId && typeof body.userId === 'string') {
    userId = body.userId;
  }

  if (!userId) return Response.json({ error: 'Sign in required.' }, { status: 401 });

  const proto = request.headers.get('x-forwarded-proto') || 'https';
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const origin = request.headers.get('origin') || (host ? `${proto}://${host}` : new URL(request.url).origin);

  try {
    const rows = await getSubscriptions(userId);
    const active = rows.find((row) => row.status === 'active' &&
      row.next_billing_date && Date.parse(row.next_billing_date) > Date.now());
    let customerId = active?.customer_id || rows.find((row) => row.customer_id)?.customer_id || null;

    if (!customerId) {
      try {
        const clerk = await clerkClient();
        const clerkUser = await clerk.users.getUser(userId);
        customerId = (clerkUser.publicMetadata?.dodo_customer_id as string) || null;
      } catch {}
    }

    if (!customerId) {
      return Response.json({ error: 'No active billing subscription found to manage.' }, { status: 404 });
    }

    const session = await dodo().customers.customerPortal.create(customerId, { return_url: `${origin}/pricing` });
    if (!session?.link || !session.link.startsWith('https://')) {
      throw new Error('Unexpected portal URL returned by billing gateway.');
    }
    return Response.json({ url: session.link });
  } catch (error: any) {
    console.error('Billing portal failed:', error);
    return Response.json({ error: error?.message || 'Billing portal unavailable. Please try again later.' }, { status: 503 });
  }
}
