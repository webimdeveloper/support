alter table clients add column if not exists ga4_snapshot jsonb;
alter table clients add column if not exists ga4_last_updated timestamp;
alter table clients add column if not exists ga4_last_error text;

alter table clients add column if not exists gsc_snapshot jsonb;
alter table clients add column if not exists gsc_last_updated timestamp;
alter table clients add column if not exists gsc_last_error text;
