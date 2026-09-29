import type { Prompt, UserProfile } from '@/types';

export type Plan = 'starter' | 'pro';
export type Membership = 'free' | Plan;

export const productIds = () => {
  const starterRaw = process.env.DODO_STARTER_PRODUCT_ID || process.env.NEXT_PUBLIC_DODO_STARTER_PRODUCT_ID;
  const proRaw = process.env.DODO_PRO_PRODUCT_ID || process.env.NEXT_PUBLIC_DODO_PRO_PRODUCT_ID;

  const starter = (starterRaw && starterRaw.startsWith('pdt_')) ? starterRaw : 'pdt_0NofwCD8d3x4QXYjW42NG';
  const pro = (proRaw && proRaw.startsWith('pdt_')) ? proRaw : 'pdt_0NofwilzJhYCXKLZAcPoM';

  return { starter, pro };
};

export interface SubscriptionRow {
  subscription_id: string;
  user_id: string;
  product_id: string;
  customer_id: string;
  status: string;
  next_billing_date: string | null;
  cancel_at_next_billing_date: boolean;
}

export function membershipFor(rows: SubscriptionRow[]): Membership {
  const ids = productIds();
  // Never grant on a redirect or a pending/failed payment; only active verified subscriptions.
  const active = rows.filter((row) => row.status === 'active' &&
    row.next_billing_date && Date.parse(row.next_billing_date) > Date.now());
  if (active.some((row) => row.product_id === ids.pro)) return 'pro';
  if (active.some((row) => row.product_id === ids.starter)) return 'starter';
  return 'free';
}

export function canCopyPrompt(prompt: Prompt, user: UserProfile | null): boolean {
  if (!prompt.is_pro || user?.role === 'admin' || user?.is_pro) return true;
  return prompt.type === 'image' && user?.membership === 'starter';
}
