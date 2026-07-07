-- Per-tab visibility control for the public navbar.
-- Key = path segment without leading slash (e.g. "goods"); false = hidden.
-- Missing key = visible, so the default '{}' keeps all tabs shown.
alter table home_settings
  add column if not exists nav_visibility jsonb not null default '{}';
