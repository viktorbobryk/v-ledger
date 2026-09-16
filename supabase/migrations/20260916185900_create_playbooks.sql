create table public.playbooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  slug text not null,
  name text not null,
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, slug)
);

alter table public.playbooks enable row level security;

revoke all on table public.playbooks from anon, public;
grant select, insert, update, delete on table public.playbooks to authenticated;

create policy "playbooks_select_own"
  on public.playbooks
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "playbooks_insert_own"
  on public.playbooks
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "playbooks_update_own"
  on public.playbooks
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "playbooks_delete_own"
  on public.playbooks
  for delete
  to authenticated
  using (auth.uid() = user_id);
