import { DodoPayments } from 'dodopayments';

const apiKey = process.env.DODO_PAYMENTS_API_KEY || '';
const environment = (process.env.DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode') || 'test_mode';

export const dodoClient = new DodoPayments({
  bearerToken: apiKey,
  environment,
});

export const DODO_PRODUCTS = {
  starter: process.env.NEXT_PUBLIC_DODO_STARTER_PRODUCT_ID || 'pdt_0NofwCD8d3x4QXYjW42NG',
  pro: process.env.NEXT_PUBLIC_DODO_PRO_PRODUCT_ID || 'pdt_0NofwilzJhYCXKLZAcPoM',
};
