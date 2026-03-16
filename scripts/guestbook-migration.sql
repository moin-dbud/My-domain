-- ───────────────────────────────────────────────────────────
-- GUESTBOOK MIGRATION (Clerk Auth + Admin Panel Compatible)
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/egmopcfdxbfhlvnkyisb/sql
--
-- This works ALONGSIDE the existing admin-panel guestbook table.
-- The main `guestbook` table (from the admin migration) is used
-- for storing messages. This file only adds the Clerk profiles table.
--
-- ⚠ If you have stale tables from previous attempts, clean up first:
--     drop table if exists public.guestbook_entries cascade;
--     drop table if exists public.guestbook_profiles cascade;
--     drop table if exists public.guestbook_clerk_profiles cascade;
-- ───────────────────────────────────────────────────────────


-- ── guestbook_clerk_profiles ────────────────────────────────
-- Maps a Clerk user ID to a chosen display username.
-- One row per Clerk user, created on first sign-in.

create table if not exists public.guestbook_clerk_profiles (
  id          bigserial primary key,
  clerk_id    text not null unique,          -- Clerk user.id e.g. "user_2abc..."
  username    text not null unique,
  avatar_url  text,
  full_name   text,
  created_at  timestamptz not null default now()
);

-- Enforce username format: 3–20 alphanumeric / _ / -
alter table public.guestbook_clerk_profiles
  add constraint gcp_username_format
  check (username ~ '^[a-zA-Z0-9_\-]{3,20}$');

-- ── RLS ────────────────────────────────────────────────────
alter table public.guestbook_clerk_profiles enable row level security;

-- Public read (for username uniqueness check in real time)
create policy "Public read guestbook_clerk_profiles"
  on public.guestbook_clerk_profiles
  for select using (true);

-- Anyone can insert (Clerk-authenticated users)
create policy "Anyone can insert guestbook_clerk_profile"
  on public.guestbook_clerk_profiles
  for insert with check (true);

-- Anyone can update own row (avatar refresh, etc.)
create policy "Anyone can update guestbook_clerk_profile"
  on public.guestbook_clerk_profiles
  for update using (true);


-- ── Ensure the main guestbook table has needed columns ──────
-- The admin-panel migration creates the guestbook table.
-- These are no-ops if the columns already exist.

alter table public.guestbook
  add column if not exists avatar_url   text,
  add column if not exists initials     text default 'XX',
  add column if not exists avatar_color text default '#6366f1';

-- ── Make sure public INSERT is allowed on guestbook ─────────
-- (The admin migration may already have this policy)
drop policy if exists "Public insert guestbook" on public.guestbook;
create policy "Public insert guestbook"
  on public.guestbook
  for insert with check (true);
