create table if not exists public.launch_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'coming-soon',
  user_agent text,
  referrer text,
  created_at timestamptz not null default now()
);

alter table public.launch_subscribers enable row level security;

drop policy if exists "Anyone can join the launch list" on public.launch_subscribers;

create policy "Anyone can join the launch list"
on public.launch_subscribers
for insert
to anon
with check (
  email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
);
