alter table clients add column if not exists google_refresh_token_enc text;
alter table clients add column if not exists google_token_scopes text[];
alter table clients add column if not exists google_token_connected_email text;
alter table clients add column if not exists google_token_connected_at timestamp;
alter table clients add column if not exists google_token_last_error text;
alter table clients add column if not exists google_services_state jsonb default '{}'::jsonb;
