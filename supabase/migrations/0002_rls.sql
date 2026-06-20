-- Row Level Security on EVERY table (spec §17). Enabled from day one.
-- Principle: profiles & approved posts are publicly readable; writes are owner-
-- scoped; money/safety tables are private to the parties involved + admins.

alter table profiles      enable row level security;
alter table badges        enable row level security;
alter table user_badges   enable row level security;
alter table posts         enable row level security;
alter table engagements   enable row level security;
alter table follows       enable row level security;
alter table bookings      enable row level security;
alter table subscriptions enable row level security;
alter table reports       enable row level security;

-- Helper: is the caller an admin?
create or replace function is_admin()
returns boolean language sql stable security definer as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$;

-- profiles -------------------------------------------------------------------
create policy "profiles readable by all" on profiles
  for select using (true);
create policy "insert own profile" on profiles
  for insert with check (id = auth.uid());
create policy "update own profile" on profiles
  for update using (id = auth.uid() or is_admin());

-- badges (catalog) — read-only to clients, writable only by admins -----------
create policy "badges readable by all" on badges
  for select using (true);
create policy "admins manage badges" on badges
  for all using (is_admin()) with check (is_admin());

-- user_badges — readable by all (drives discovery filters); owner/system write
create policy "user_badges readable by all" on user_badges
  for select using (true);
create policy "owner manages own badges" on user_badges
  for all using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

-- posts — approved are public; authors see their own pending/blocked ----------
create policy "approved posts public" on posts
  for select using (moderation_status = 'approved' or user_id = auth.uid() or is_admin());
create policy "insert own posts" on posts
  for insert with check (user_id = auth.uid());
create policy "update own posts" on posts
  for update using (user_id = auth.uid() or is_admin());
create policy "delete own posts" on posts
  for delete using (user_id = auth.uid() or is_admin());

-- engagements — readable by all (counts are public); only your own writes -----
create policy "engagements readable by all" on engagements
  for select using (true);
create policy "insert own engagement" on engagements
  for insert with check (user_id = auth.uid());
create policy "delete own engagement" on engagements
  for delete using (user_id = auth.uid());

-- follows --------------------------------------------------------------------
create policy "follows readable by all" on follows
  for select using (true);
create policy "follow as self" on follows
  for insert with check (follower_id = auth.uid());
create policy "unfollow as self" on follows
  for delete using (follower_id = auth.uid());

-- bookings — visible only to the two parties (+ admins) ----------------------
create policy "parties read booking" on bookings
  for select using (client_id = auth.uid() or artist_id = auth.uid() or is_admin());
create policy "client creates booking" on bookings
  for insert with check (client_id = auth.uid());
-- Status/escrow transitions are performed by Edge Functions using the service
-- role, which bypasses RLS. Direct client UPDATEs are not permitted.

-- subscriptions — private to the user ----------------------------------------
create policy "own subscriptions" on subscriptions
  for select using (user_id = auth.uid() or is_admin());

-- reports — reporter can create and see their own; admins see all ------------
create policy "create report" on reports
  for insert with check (reporter_id = auth.uid());
create policy "read own or admin reports" on reports
  for select using (reporter_id = auth.uid() or is_admin());
create policy "admins manage reports" on reports
  for update using (is_admin());
