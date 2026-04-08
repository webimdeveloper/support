alter table clients add column if not exists gtm_account_id varchar(50);
alter table clients add column if not exists gtm_container_id varchar(50);
alter table clients add column if not exists gtm_workspace_id varchar(50);
alter table clients add column if not exists ga4_property_id varchar(50);
alter table clients add column if not exists gsc_site_url varchar(255);
alter table clients add column if not exists clarity_project_id varchar(50);
alter table clients add column if not exists hotjar_site_id varchar(50);

alter table clients add column if not exists gtm_audit_data jsonb;
alter table clients add column if not exists gtm_ai_analysis text;
alter table clients add column if not exists gtm_last_updated timestamp;
