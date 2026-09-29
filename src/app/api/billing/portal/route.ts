import { auth } from '@clerk/nextjs/server';
import { dodo, getSubscriptions } from '@/lib/billing';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: 'Sign in required.' }, { status: 401 });
  const origin = new URL(request.url).origin;
  if (request.headers.get('origin') !== origin) return Response.json({ error: 'Invalid origin.' }, { status: 403 });
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
