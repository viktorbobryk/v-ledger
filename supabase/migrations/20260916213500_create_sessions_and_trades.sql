create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  session_date date not null,
  deposit numeric not null default 200,
  risk_percent numeric not null default 2,
  consecutive_losses integer not null default 0,
  status text not null default 'trade',
  created_at timestamptz not null default now(),
  unique (user_id, session_date),
  constraint sessions_status_check check (status in ('trade', 'pause')),
  constraint sessions_losses_check check (consecutive_losses >= 0)
);

create table public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  session_id uuid not null references public.sessions (id) on delete cascade,
  playbook_id uuid references public.playbooks (id) on delete set null,
  instrument text not null,
  side text not null,
  status text not null default 'planned',
  planned_entry numeric,
  planned_sl numeric,
  planned_tp numeric,
  filled_entry numeric,
  filled_exit numeric,
  realized_r numeric,
  notes text not null default '',
  created_at timestamptz not null default now(),
  constraint trades_side_check check (side in ('long', 'short')),
  constraint trades_status_check check (status in ('planned', 'open', 'closed', 'skipped'))
);

create index trades_session_id_idx on public.trades (session_id);
create index trades_user_id_created_at_idx on public.trades (user_id, created_at desc);

alter table public.sessions enable row level security;
alter table public.trades enable row level security;

revoke all on table public.sessions from anon, public;
revoke all on table public.trades from anon, public;
grant select, insert, update, delete on table public.sessions to authenticated;
grant select, insert, update, delete on table public.trades to authenticated;

create policy "sessions_select_own"
  on public.sessions for select to authenticated
  using (auth.uid() = user_id);

create policy "sessions_insert_own"
  on public.sessions for insert to authenticated
  with check (auth.uid() = user_id);

create policy "sessions_update_own"
  on public.sessions for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "sessions_delete_own"
  on public.sessions for delete to authenticated
  using (auth.uid() = user_id);

create policy "trades_select_own"
  on public.trades for select to authenticated
  using (auth.uid() = user_id);

create policy "trades_insert_own"
  on public.trades for insert to authenticated
  with check (auth.uid() = user_id);

create policy "trades_update_own"
  on public.trades for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "trades_delete_own"
  on public.trades for delete to authenticated
  using (auth.uid() = user_id);
