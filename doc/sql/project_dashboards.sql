create table if not exists project_dashboards (
  id uuid primary key default gen_random_uuid(),
  client_slug text not null,
  project_slug text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (client_slug, project_slug)
);

create index if not exists idx_project_dashboards_client_project
  on project_dashboards (client_slug, project_slug);
