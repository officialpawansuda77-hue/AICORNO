import { auth } from '@clerk/nextjs/server';
import { dodo, getSubscriptions } from '@/lib/billing';

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
  const origin = new URL(request.url).origin;
  const reqOrigin = request.headers.get('origin');
  if (reqOrigin && reqOrigin !== origin) {
    try {
      const parsedReq = new URL(reqOrigin).hostname;
      const parsedApp = new URL(origin).hostname;
      if (parsedReq !== parsedApp && !parsedReq.endsWith('vercel.app')) {
        return Response.json({ error: 'Invalid origin.' }, { status: 403 });
      }
    } catch {}
  }
  try {
    const rows = await getSubscriptions(userId);
    const active = rows.find((row) => row.status === 'active' &&
      row.next_billing_date && Date.parse(row.next_billing_date) > Date.now());
    const customerId = active?.customer_id || rows.find((row) => row.customer_id)?.customer_id;
    if (!customerId) {
      return Response.json({ error: 'No active subscription found.' }, { status: 404 });
    }
    const session = await dodo().customers.customerPortal.create(customerId, { return_url: `${origin}/dashboard` });
    const url = new URL(session.link);
    if (url.protocol !== 'https:' || !url.hostname.endsWith('.dodopayments.com')) throw new Error('Unexpected portal URL');
    return Response.json({ url: session.link });
  } catch (error) {
    console.error('Billing portal failed:', error);
    return Response.json({ error: 'Billing portal unavailable. Please try again later.' }, { status: 503 });
  }
}
