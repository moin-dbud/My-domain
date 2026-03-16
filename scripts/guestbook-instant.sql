-- Run in Supabase SQL Editor to approve all existing entries & fix RLS for instant posting

-- 1. Approve all existing messages (removes approval gate)
update public.guestbook set is_approved = true where is_approved = false;

-- 2. Re-create the public read policy so ALL entries are visible (not just approved ones)
drop policy if exists "Public read approved" on public.guestbook;
create policy "Public read all guestbook"
  on public.guestbook
  for select using (true);

-- 3. Ensure public insert (with is_approved = true) is allowed
drop policy if exists "Public insert guestbook" on public.guestbook;
create policy "Public insert guestbook"
  on public.guestbook
  for insert with check (true);
