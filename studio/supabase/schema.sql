-- Draftpace Studio, hosted: the same shapes as lib/server/store.ts (local mode),
-- in Studio's own Supabase project (never the website's). Not applied anywhere yet.

create table studio_reviews (
  film_id     text primary key,
  status      text not null check (status in ('approved', 'changes', 'rejected')),
  note        text not null default '',
  reviewed_by uuid references auth.users (id),
  at          timestamptz not null default now()
);

create table studio_schedule (
  id          text primary key,
  film_id     text not null,
  platform    text not null,
  date        date not null,
  time        text not null default '09:00',
  caption     text not null,
  link        text not null,
  status      text not null default 'scheduled' check (status in ('scheduled', 'posted')),
  created_at  timestamptz not null default now()
);
create index on studio_schedule (date);

create table studio_jobs (
  id          text primary key,
  film_id     text not null,
  status      text not null check (status in ('running', 'done', 'failed')),
  progress    int not null default 0,
  message     text not null default '',
  started_at  timestamptz not null default now(),
  finished_at timestamptz
);

-- Studio is one team's tool: only its signed-in members read or write.
alter table studio_reviews enable row level security;
alter table studio_schedule enable row level security;
alter table studio_jobs enable row level security;
create policy "studio members" on studio_reviews for all to authenticated using (true) with check (true);
create policy "studio members" on studio_schedule for all to authenticated using (true) with check (true);
create policy "studio members" on studio_jobs for all to authenticated using (true) with check (true);
