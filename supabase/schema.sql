-- =============================================================
-- HackMate schema
-- Run this in the Supabase SQL Editor (Database > SQL Editor)
-- =============================================================

-- -------------------------------------------------------------
-- PROFILES
-- One profile per authenticated user.
-- Demo/seed profiles have is_demo = true and a fixed user_id that
-- has no matching auth.users row.
-- -------------------------------------------------------------
create table if not exists public.profiles (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null unique,
  name             text not null default '',
  username         text,
  avatar_url       text,
  bio              text not null default '',
  role             text not null default '',
  experience_level text check (experience_level in ('Beginner', 'Intermediate', 'Advanced') or experience_level is null),
  skills           text[] not null default '{}',
  interests        text[] not null default '{}',
  looking_for      text[] not null default '{}',
  availability     text,
  github_url       text,
  discord_username text,
  github_skills    text[] not null default '{}',
  github_topics    text[] not null default '{}',
  github_synced_at timestamptz,
  is_demo          boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_profiles_user_id on public.profiles (user_id);
create index if not exists idx_profiles_is_demo on public.profiles (is_demo);

alter table public.profiles enable row level security;

-- Everyone signed in can read all public profiles (needed for discovery)
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

-- A user can create their own profile; any authenticated user may insert demo profiles
create policy "profiles_insert_own_or_demo"
  on public.profiles for insert
  to authenticated
  with check (user_id = auth.uid() or is_demo = true);

-- Only the owner can update their profile
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- No delete policy: profiles are not deletable through the API.

-- -------------------------------------------------------------
-- SWIPES
-- One decision per (user, target). Re-swiping upserts the action.
-- -------------------------------------------------------------
create table if not exists public.swipes (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null,
  target_user_id uuid not null,
  action         text not null check (action in ('LIKE', 'PASS')),
  created_at     timestamptz not null default now(),
  unique (user_id, target_user_id),
  check (user_id <> target_user_id)
);

create index if not exists idx_swipes_target on public.swipes (target_user_id);

alter table public.swipes enable row level security;

-- Read your own swipes + swipes that target you (needed for reciprocal-like checks)
create policy "swipes_select_own_or_targeting_me"
  on public.swipes for select
  to authenticated
  using (user_id = auth.uid() or target_user_id = auth.uid());

-- Only create/update/delete your own swipes
create policy "swipes_insert_own"
  on public.swipes for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "swipes_update_own"
  on public.swipes for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "swipes_delete_own"
  on public.swipes for delete
  to authenticated
  using (user_id = auth.uid());

-- -------------------------------------------------------------
-- MATCHES
-- Mutual likes. The application always stores the pair in
-- canonical order (smaller uuid first) so the unique constraint
-- prevents duplicate matches in both directions.
-- -------------------------------------------------------------
create table if not exists public.matches (
  id                    uuid primary key default gen_random_uuid(),
  user1_id              uuid not null,
  user2_id              uuid not null,
  compatibility_score   integer not null check (compatibility_score between 0 and 100),
  compatibility_reasons text[] not null default '{}',
  created_at            timestamptz not null default now(),
  unique (user1_id, user2_id),
  check (user1_id <> user2_id)
);

create index if not exists idx_matches_user1 on public.matches (user1_id);
create index if not exists idx_matches_user2 on public.matches (user2_id);

alter table public.matches enable row level security;

-- Read only matches you are part of
create policy "matches_select_participant"
  on public.matches for select
  to authenticated
  using (user1_id = auth.uid() or user2_id = auth.uid());

-- Only participants can insert a match
create policy "matches_insert_participant"
  on public.matches for insert
  to authenticated
  with check (user1_id = auth.uid() or user2_id = auth.uid());

-- No update/delete policies for MVP: matches are immutable once created.

-- -------------------------------------------------------------
-- MESSAGES
-- Chat threads between matched users. A message belongs to a match.
-- Both participants can read the thread; a participant sends as
-- themselves. Inserts "as" a demo participant are allowed so that
-- demo profiles can reply in single-account demos.
--
-- MIGRATION: run this whole section once in the SQL Editor on an
-- existing database (safe to re-run except policy creation).
-- -------------------------------------------------------------
create table if not exists public.messages (
  id         bigint generated always as identity primary key,
  match_id   uuid not null,
  sender_id  uuid not null,
  body       text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_match on public.messages (match_id, created_at);

alter table public.messages enable row level security;

-- Both participants of the match can read the thread
create policy "messages_select_participant"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.matches m
      where m.id = messages.match_id
        and (m.user1_id = auth.uid() or m.user2_id = auth.uid())
    )
  );

-- Sender must be a participant of the match; either the current user
-- or a demo profile (so demo partners can reply)
create policy "messages_insert_participant_or_demo"
  on public.messages for insert
  to authenticated
  with check (
    exists (
      select 1 from public.matches m
      where m.id = messages.match_id
        and (
          (m.user1_id = auth.uid() and m.user2_id = sender_id)
          or (m.user2_id = auth.uid() and m.user1_id = sender_id)
        )
    )
    and (
      sender_id = auth.uid()
      or exists (
        select 1 from public.profiles p
        where p.user_id = messages.sender_id and p.is_demo
      )
    )
  );

-- No update/delete policies: chat history is immutable.

-- Stream new messages to subscribed clients via Supabase Realtime
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

-- -------------------------------------------------------------
-- MIGRATION: GitHub sync columns
-- Safe to re-run on an existing database.
-- -------------------------------------------------------------
alter table public.profiles add column if not exists github_skills text[] not null default '{}';
alter table public.profiles add column if not exists github_topics text[] not null default '{}';
alter table public.profiles add column if not exists github_synced_at timestamptz;
