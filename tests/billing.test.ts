import assert from 'node:assert/strict';
import { test } from 'node:test';
import { IMAGE_PROMPTS } from '../src/data/imagePrompts';
import { VIDEO_PROMPTS } from '../src/data/videoPrompts';
import { canCopyPrompt, membershipFor, type SubscriptionRow } from '../src/lib/membership';
import { isEmailAdmin } from '../src/lib/authUtils';
import type { UserProfile } from '../src/types';
import DodoPayments from 'dodopayments';
import { Webhook } from 'standardwebhooks';

const row = (product_id: string, status = 'active', next_billing_date: string | null = '2099-01-01T00:00:00Z'): SubscriptionRow => ({
  subscription_id: 'sub_test', user_id: 'user_test', customer_id: 'cus_test',
  product_id, status, next_billing_date, cancel_at_next_billing_date: false,
});
const user = (membership: UserProfile['membership']): UserProfile => ({
  id: 'user_test', name: 'Test', email: 'test@example.com', handle: '@test',
  avatar: '', role: 'user', is_pro: membership === 'pro', membership, joined_date: '2026',
});

test('Dodo SDK verifies signed raw webhook body and rejects tampering', () => {
  const key = 'whsec_' + Buffer.alloc(32, 7).toString('base64');
  const webhook = new Webhook(key);
  const body = JSON.stringify({ type: 'subscription.active', timestamp: new Date().toISOString(), data: {} });
  const timestamp = new Date(Math.floor(Date.now() / 1000) * 1000);
  const headers = {
    'webhook-id': 'evt_example',
    'webhook-timestamp': Math.floor(timestamp.getTime() / 1000).toString(),
    'webhook-signature': webhook.sign('evt_example', timestamp, body),
  };
  const client = new DodoPayments({ bearerToken: 'test-only', environment: 'test_mode' });
  assert.equal(client.webhooks.unwrap(body, { headers, key }).type, 'subscription.active');
  assert.throws(() => client.webhooks.unwrap(body + ' ', { headers, key }));
});

test('membership requires an active, non-expired allowlisted product', () => {
  process.env.DODO_STARTER_PRODUCT_ID = 'pdt_starter_test';
  process.env.DODO_PRO_PRODUCT_ID = 'pdt_pro_test';
  assert.equal(membershipFor([row('pdt_starter_test')]), 'starter');
  assert.equal(membershipFor([row('pdt_pro_test')]), 'pro');
  assert.equal(membershipFor([row('pdt_starter_test'), row('pdt_pro_test')]), 'pro');
  assert.equal(membershipFor([row('pdt_unknown')]), 'free');
  for (const status of ['pending', 'past_due', 'on_hold', 'paused', 'failed', 'expired', 'cancelled']) {
    assert.equal(membershipFor([row('pdt_pro_test', status)]), 'free');
  }
  assert.equal(membershipFor([row('pdt_pro_test', 'active', '2020-01-01T00:00:00Z')]), 'free');
  assert.equal(membershipFor([row('pdt_pro_test', 'active', null)]), 'free');
});

test('only the exact owner email has admin privileges', () => {
  assert.equal(isEmailAdmin('sudapawan301@gmail.com'), true);
  assert.equal(isEmailAdmin('sudapawan301@another-domain.example'), false);
});

test('Starter copies premium images only; Pro also copies premium videos', () => {
  const premiumImage = { is_pro: true, type: 'image' } as any;
  const premiumVideo = { is_pro: true, type: 'video' } as any;
  const freePrompt = { is_pro: false, type: 'image' } as any;
  assert.equal(canCopyPrompt(premiumImage, null), false);
  assert.equal(canCopyPrompt(premiumImage, user('starter')), true);
  assert.equal(canCopyPrompt(premiumVideo, user('starter')), false);
  assert.equal(canCopyPrompt(premiumVideo, user('pro')), true);
  assert.equal(canCopyPrompt(freePrompt, null), true);
});
