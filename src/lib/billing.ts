import 'server-only';

import DodoPayments from 'dodopayments';
import { supabaseAdmin } from '@/lib/supabase';
import { productIds, type SubscriptionRow } from '@/lib/membership';
export { membershipFor, productIds } from '@/lib/membership';
export type { Plan, Membership } from '@/lib/membership';

export function configured() {
  return Boolean(process.env.DODO_PAYMENTS_API_KEY && productIds().starter && productIds().pro);
}

export function dodo() {
  if (!process.env.DODO_PAYMENTS_API_KEY) throw new Error('Dodo API key not configured');
  return new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment: process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode' ? 'live_mode' : 'test_mode',
  });
}

export async function getSubscriptions(userId: string): Promise<SubscriptionRow[]> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('[getSubscriptions] Supabase service role not configured, returning empty subscriptions');
    return [];
  }
  try {
    const { data, error } = await supabaseAdmin
      .from('dodo_subscriptions')
      .select('subscription_id,user_id,product_id,customer_id,status,next_billing_date,cancel_at_next_billing_date')
      .eq('user_id', userId);
    if (error) {
      // Table may not exist yet in Supabase schema (code PGRST205)
      console.warn('[getSubscriptions] Supabase query notice (table may not be migrated yet):', error.message || error.code);
      return [];
    }
    return data || [];
  } catch (error: any) {
    console.warn('[getSubscriptions] Exception caught, falling back safely:', error?.message);
    return [];
  }
}

