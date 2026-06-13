-- Align with Supabase project: RLS enabled, auto-expose new tables disabled.
-- Policies are added in a later migration; until then only service_role bypasses RLS.

alter table public.dashboards enable row level security;
alter table public.widgets enable row level security;
alter table public.connections enable row level security;
alter table public.events enable row level security;
alter table public.widget_state enable row level security;
alter table public.achievements enable row level security;

-- Required when "auto-expose new tables" is off: API roles need explicit grants.
grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on public.dashboards to authenticated, service_role;
grant select, insert, update, delete on public.widgets to authenticated, service_role;
grant select, insert, update, delete on public.connections to authenticated, service_role;
grant select, insert, update, delete on public.events to authenticated, service_role;
grant select, insert, update, delete on public.widget_state to authenticated, service_role;
grant select, insert, update, delete on public.achievements to authenticated, service_role;

grant select on public.dashboards to anon;
grant select on public.widgets to anon;
grant select on public.connections to anon;
grant select on public.events to anon;
grant select on public.widget_state to anon;
grant select on public.achievements to anon;
