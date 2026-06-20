-- Feature Me — core schema (spec §3).
-- Postgres + PostGIS. RLS is enabled on EVERY table (non-negotiable, spec §17).

create extension if not exists postgis;
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type tier as enum ('bronze', 'silver', 'gold', 'diamond');

create type craft as enum (
  'rapper','singer','producer','photographer','videographer','model','barber',
  'dj','dancer','actor','graphic_designer','makeup_artist','tattoo_artist',
  'writer','fashion'
);

create type engagement_type as enum ('like', 'save', 'share');

create type moderation_status as enum ('pending', 'approved', 'blocked');

create type booking_status as enum (
  'requested','accepted','funded','in_progress','delivered','revision',
  'completed','disputed','refunded','cancelled'
);

create type report_status as enum ('open','reviewing','actioned','dismissed');

-- ---------------------------------------------------------------------------
-- profiles  (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  handle        text unique not null,
  display_name  text not null,
  bio           text,
  avatar_url    text,
  craft         craft not null,
  comp_artist   text,
  city          text,
  state         text,
  location      geography(Point, 4326),
  radius_mi     int not null default 25 check (radius_mi between 1 and 500),
  tier_overall  tier not null default 'bronze',
  is_verified   boolean not null default false,
  is_admin      boolean not null default false,
  created_at    timestamptz not null default now()
);

create index profiles_location_gix on profiles using gist (location);
create index profiles_craft_idx on profiles (craft);

-- ---------------------------------------------------------------------------
-- badges  (catalog of every badge that exists)
-- ---------------------------------------------------------------------------
create table badges (
  id          uuid primary key default uuid_generate_v4(),
  craft       craft not null,
  name        text not null,
  slug        text unique not null,
  description text not null,
  icon_key    text not null
);

create index badges_craft_idx on badges (craft);

-- ---------------------------------------------------------------------------
-- user_badges  (a badge a user holds + Love/Proof progress)
-- ---------------------------------------------------------------------------
create table user_badges (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references profiles(id) on delete cascade,
  badge_id           uuid not null references badges(id) on delete cascade,
  tier               tier not null default 'bronze',
  love_points        int not null default 0,
  verified_bookings  int not null default 0,
  progress_pct       int not null default 0 check (progress_pct between 0 and 100),
  updated_at         timestamptz not null default now(),
  unique (user_id, badge_id)
);

create index user_badges_user_idx on user_badges (user_id);

-- ---------------------------------------------------------------------------
-- posts
-- ---------------------------------------------------------------------------
create table posts (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references profiles(id) on delete cascade,
  image_url          text not null,
  caption            text,
  craft              craft not null,
  created_at         timestamptz not null default now(),
  like_count         int not null default 0,
  save_count         int not null default 0,
  share_count        int not null default 0,
  moderation_status  moderation_status not null default 'pending'
);

create index posts_user_idx on posts (user_id);
create index posts_created_idx on posts (created_at desc);

-- ---------------------------------------------------------------------------
-- engagements  (Love — positive only; NO dislikes ever, spec §17)
-- ---------------------------------------------------------------------------
create table engagements (
  id          uuid primary key default uuid_generate_v4(),
  post_id     uuid not null references posts(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  type        engagement_type not null,
  weight      double precision not null default 1.0, -- reputation-weighted, invisible
  created_at  timestamptz not null default now(),
  unique (post_id, user_id, type)
);

create index engagements_post_idx on engagements (post_id);

-- ---------------------------------------------------------------------------
-- follows  (asymmetric social graph)
-- ---------------------------------------------------------------------------
create table follows (
  follower_id  uuid not null references profiles(id) on delete cascade,
  following_id uuid not null references profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

-- ---------------------------------------------------------------------------
-- bookings  (marketplace + escrow, spec §8)
-- ---------------------------------------------------------------------------
create table bookings (
  id                    uuid primary key default uuid_generate_v4(),
  client_id             uuid not null references profiles(id) on delete cascade,
  artist_id             uuid not null references profiles(id) on delete cascade,
  badge_context         text,
  tier                  tier not null,
  amount_cents          int not null check (amount_cents > 0 and amount_cents < 100000),
  fee_cents             int not null,
  status                booking_status not null default 'requested',
  revisions_allowed     int not null default 1 check (revisions_allowed between 0 and 3),
  revisions_used        int not null default 0,
  scheduled_for         timestamptz,
  stripe_payment_intent text,
  stripe_transfer_id    text,
  created_at            timestamptz not null default now(),
  check (client_id <> artist_id)
);

create index bookings_client_idx on bookings (client_id);
create index bookings_artist_idx on bookings (artist_id);

-- ---------------------------------------------------------------------------
-- subscriptions  (RevenueCat mirror — FM+, boosts, certified check)
-- ---------------------------------------------------------------------------
create table subscriptions (
  user_id      uuid not null references profiles(id) on delete cascade,
  product_id   text not null,
  status       text not null,
  expires_at   timestamptz,
  entitlements jsonb not null default '{}'::jsonb,
  updated_at   timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ---------------------------------------------------------------------------
-- reports  (trust & safety)
-- ---------------------------------------------------------------------------
create table reports (
  id          uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  target_type text not null check (target_type in ('post','profile','message')),
  target_id   uuid not null,
  reason      text not null,
  status      report_status not null default 'open',
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- nearby_artists RPC (PostGIS radius query, spec §3/§12)
-- ---------------------------------------------------------------------------
create or replace function nearby_artists(
  lat float,
  lng float,
  radius_mi float,
  craft_filter text default null
)
returns table (like profiles including all, distance_mi float)
language sql stable
as $$
  select p.*,
         st_distance(p.location, st_makepoint(lng, lat)::geography) / 1609.34 as distance_mi
  from profiles p
  where p.location is not null
    and (craft_filter is null or p.craft::text = craft_filter)
    and st_dwithin(p.location, st_makepoint(lng, lat)::geography, radius_mi * 1609.34)
  order by p.location <-> st_makepoint(lng, lat)::geography;
$$;
