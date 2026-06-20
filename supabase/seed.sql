-- Feature Me — seed data (spec §14). Founder @Mulamaxs (Diamond everything,
-- certified, admin) + demo artists clustered in the DC / NoVA metro so Feed and
-- Discover are alive on first run. Mirrors src/data/mock.ts.
--
-- Run order:  0001_init.sql → 0002_rls.sql → seed_badges.sql → seed.sql
-- Local dev:  supabase db reset   (picks up migrations + seed automatically)
--
-- NOTE: profiles.id references auth.users(id). For local/dev we create matching
-- auth.users rows with fixed UUIDs. In production, profiles are created by the
-- onboarding flow after real sign-up; do not insert auth.users by hand there.

-- Catalog first (badges are referenced by user_badges below).
\i seed_badges.sql

-- --- auth users (local/dev only) -------------------------------------------
insert into auth.users (id, email, raw_user_meta_data, created_at)
values
  ('00000000-0000-0000-0000-000000000001', 'mula@featureme.app',     '{}', now()),
  ('00000000-0000-0000-0000-000000000002', 'aria@featureme.app',     '{}', now()),
  ('00000000-0000-0000-0000-000000000003', 'trey@featureme.app',     '{}', now()),
  ('00000000-0000-0000-0000-000000000004', 'kai@featureme.app',      '{}', now()),
  ('00000000-0000-0000-0000-000000000005', 'dom@featureme.app',      '{}', now()),
  ('00000000-0000-0000-0000-000000000006', 'jade@featureme.app',     '{}', now()),
  ('00000000-0000-0000-0000-000000000007', 'marcus@featureme.app',   '{}', now()),
  ('00000000-0000-0000-0000-000000000008', 'nikki@featureme.app',    '{}', now()),
  ('00000000-0000-0000-0000-000000000009', 'zo@featureme.app',       '{}', now())
on conflict (id) do nothing;

-- --- profiles ---------------------------------------------------------------
-- location = ST_MakePoint(lng, lat). Founder centers on Centreville, VA.
insert into profiles
  (id, handle, display_name, bio, avatar_url, craft, comp_artist, city, state, location, radius_mi, tier_overall, is_verified, is_admin)
values
  ('00000000-0000-0000-0000-000000000001', 'Mulamaxs', 'Mula', 'Founder of Feature Me. Building the home for every artist. 🏆', 'https://picsum.photos/seed/fm-av-mula/240/240', 'rapper', 'Lil Uzi Vert', 'Centreville', 'VA', st_makepoint(-77.429, 38.841)::geography, 25, 'diamond', true, true),
  ('00000000-0000-0000-0000-000000000002', 'novasinger', 'Aria Bell', 'R&B vocalist. Runs for days.', 'https://picsum.photos/seed/fm-av-aria/240/240', 'singer', 'SZA', 'Fairfax', 'VA', st_makepoint(-77.306, 38.846)::geography, 25, 'gold', true, false),
  ('00000000-0000-0000-0000-000000000003', '808dmv', 'Trey Banks', 'Producer. 808s that knock.', 'https://picsum.photos/seed/fm-av-trey/240/240', 'producer', 'Metro Boomin', 'Arlington', 'VA', st_makepoint(-77.100, 38.880)::geography, 30, 'silver', false, false),
  ('00000000-0000-0000-0000-000000000004', 'shotbykai', 'Kai Monroe', 'Photographer. Golden hour specialist.', 'https://picsum.photos/seed/fm-av-kai/240/240', 'photographer', 'Cam Kirk', 'Washington', 'DC', st_makepoint(-77.037, 38.907)::geography, 20, 'gold', true, false),
  ('00000000-0000-0000-0000-000000000005', 'lensgod', 'Dom Rivera', 'Music video director. One-take energy.', 'https://picsum.photos/seed/fm-av-dom/240/240', 'videographer', 'Cole Bennett', 'Alexandria', 'VA', st_makepoint(-77.047, 38.805)::geography, 35, 'silver', false, false),
  ('00000000-0000-0000-0000-000000000006', 'jadewalks', 'Jade Lin', 'Model. Editorial + runway.', 'https://picsum.photos/seed/fm-av-jade/240/240', 'model', 'Adut Akech', 'Bethesda', 'MD', st_makepoint(-77.094, 38.984)::geography, 25, 'bronze', false, false),
  ('00000000-0000-0000-0000-000000000007', 'fadeking', 'Marcus Cole', 'Barber. Cleanest fades in NoVA.', 'https://picsum.photos/seed/fm-av-marcus/240/240', 'barber', 'Vic Blends', 'Manassas', 'VA', st_makepoint(-77.475, 38.751)::geography, 15, 'gold', true, false),
  ('00000000-0000-0000-0000-000000000008', 'djspinz', 'Nikki Spin', 'Open-format DJ. I read the room.', 'https://picsum.photos/seed/fm-av-nikki/240/240', 'dj', 'Kaytranada', 'Reston', 'VA', st_makepoint(-77.357, 38.958)::geography, 40, 'silver', false, false),
  ('00000000-0000-0000-0000-000000000009', 'youngflow', 'Zo', 'Rapper. Punchlines for days.', 'https://picsum.photos/seed/fm-av-zo/240/240', 'rapper', 'J. Cole', 'Centreville', 'VA', st_makepoint(-77.440, 38.840)::geography, 25, 'bronze', false, false)
on conflict (id) do nothing;

-- --- user_badges (founder = Diamond rapper set; demo = mixed tiers) ----------
insert into user_badges (user_id, badge_id, tier, love_points, verified_bookings, progress_pct)
select u.user_id, b.id, u.tier, u.love, u.proof, 100
from (values
  ('00000000-0000-0000-0000-000000000001'::uuid, 'rapper.golden-voice', 'diamond'::tier, 20000, 40),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'rapper.lyrical-pen',  'diamond'::tier, 20000, 40),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'rapper.steady-flow',  'diamond'::tier, 20000, 40),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'rapper.crowd-mover',  'diamond'::tier, 20000, 40),
  ('00000000-0000-0000-0000-000000000002'::uuid, 'singer.golden-voice', 'gold'::tier,     4200, 5),
  ('00000000-0000-0000-0000-000000000003'::uuid, 'producer.808-architect','silver'::tier, 1100, 0),
  ('00000000-0000-0000-0000-000000000004'::uuid, 'photographer.golden-hour','gold'::tier, 3800, 4),
  ('00000000-0000-0000-0000-000000000005'::uuid, 'videographer.cinematic-eye','silver'::tier,1300,1),
  ('00000000-0000-0000-0000-000000000006'::uuid, 'model.golden-smile',  'bronze'::tier,    140, 0),
  ('00000000-0000-0000-0000-000000000007'::uuid, 'barber.fade-master',  'gold'::tier,     5200, 8),
  ('00000000-0000-0000-0000-000000000008'::uuid, 'dj.crowd-read',       'silver'::tier,    800, 1),
  ('00000000-0000-0000-0000-000000000009'::uuid, 'rapper.punchline',    'bronze'::tier,    300, 0)
) as u(user_id, slug, tier, love, proof)
join badges b on b.slug = u.slug
on conflict (user_id, badge_id) do nothing;

-- --- showcase posts (approved so they appear in Feed immediately) ------------
insert into posts (user_id, image_url, caption, craft, moderation_status, like_count)
values
  ('00000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/fm-Mulamaxs-0/900/1300', 'New verse dropping 🔥', 'rapper', 'approved', 940),
  ('00000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/fm-Mulamaxs-1/900/1300', 'Studio nights', 'rapper', 'approved', 720),
  ('00000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/fm-novasinger-0/900/1300', 'Late night runs 🎶', 'singer', 'approved', 530),
  ('00000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/fm-shotbykai-0/900/1300', 'Golden hour magic 📷', 'photographer', 'approved', 610),
  ('00000000-0000-0000-0000-000000000007', 'https://picsum.photos/seed/fm-fadeking-0/900/1300', 'Clean fade ✂️', 'barber', 'approved', 410);
