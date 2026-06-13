-- Per-user access to dashboards (required when RLS is enabled)

create policy "Users can select own dashboards"
  on public.dashboards for select
  using (auth.uid() = user_id);

create policy "Users can insert own dashboards"
  on public.dashboards for insert
  with check (auth.uid() = user_id);

create policy "Users can update own dashboards"
  on public.dashboards for update
  using (auth.uid() = user_id);

create policy "Users can delete own dashboards"
  on public.dashboards for delete
  using (auth.uid() = user_id);
