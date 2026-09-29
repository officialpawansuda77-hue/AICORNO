import { POST as dodoWebhookHandler } from '@/app/api/webhooks/dodo/route';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  return dodoWebhookHandler(request);
}
