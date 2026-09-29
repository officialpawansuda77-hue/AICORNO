-- Apply in Supabase SQL editor before enabling Dodo checkout. Only the service role can read/write.
create table if not exists public.dodo_subscriptions (
  subscription_id text primary key,
  user_id text not null,
  customer_id text not null,
  product_id text not null,
  status text not null,
  next_billing_date timestamptz,
  cancel_at_next_billing_date boolean not null default false,
  last_event_at timestamptz not null,
  updated_at timestamptz not null default now()
);
create index if not exists dodo_subscriptions_user_id_idx on public.dodo_subscriptions (user_id);
create table if not exists public.dodo_webhook_events (
  event_id text primary key,
  received_at timestamptz not null default now()
);
alter table public.dodo_subscriptions enable row level security;
alter table public.dodo_webhook_events enable row level security;
revoke all on public.dodo_subscriptions, public.dodo_webhook_events from anon, authenticated;
grant select, insert, update on public.dodo_subscriptions to service_role;
grant select, insert on public.dodo_webhook_events to service_role;

create or replace function public.apply_dodo_subscription_event(
  p_event_id text,
  p_subscription_id text,
  p_user_id text,
  p_customer_id text,
  p_product_id text,
  p_status text,
  p_next_billing_date timestamptz,
  p_cancel_at_next_billing_date boolean,
  p_event_at timestamptz
) returns void language plpgsql set search_path = public as $$
declare v_existing_user text;
begin
  if p_event_id is null or p_subscription_id is null or p_user_id is null or p_user_id = ''
     or p_user_id = 'unknown' or p_customer_id is null or p_product_id is null or p_product_id = ''
     or p_status is null or p_event_at is null then
    raise exception 'Incomplete Dodo webhook';
  end if;
  insert into public.dodo_webhook_events(event_id) values (p_event_id)
    on conflict (event_id) do nothing;
  if not found then return; end if;
  select user_id into v_existing_user from public.dodo_subscriptions
    where subscription_id = p_subscription_id for update;
  if v_existing_user is not null and v_existing_user <> p_user_id then
    raise exception 'Subscription owner mismatch';
  end if;
  insert into public.dodo_subscriptions (
    subscription_id, user_id, customer_id, product_id, status, next_billing_date,
    cancel_at_next_billing_date, last_event_at, updated_at
  ) values (
    p_subscription_id, p_user_id, p_customer_id, p_product_id, p_status,
    p_next_billing_date, p_cancel_at_next_billing_date, p_event_at, now()
  ) on conflict (subscription_id) do update set
    customer_id = excluded.customer_id, product_id = excluded.product_id,
    status = excluded.status, next_billing_date = excluded.next_billing_date,
    cancel_at_next_billing_date = excluded.cancel_at_next_billing_date,
    last_event_at = excluded.last_event_at, updated_at = now()
  where public.dodo_subscriptions.last_event_at < excluded.last_event_at;
end;
$$;
revoke all on function public.apply_dodo_subscription_event(text,text,text,text,text,text,timestamptz,boolean,timestamptz) from public, anon, authenticated;
grant execute on function public.apply_dodo_subscription_event(text,text,text,text,text,text,timestamptz,boolean,timestamptz) to service_role;
