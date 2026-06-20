# Feature Me (FM)

A location-based app where artists of every kind get discovered, ranked, and
booked. **2K MyPlayer + TikTok + LinkedIn — for creators, for business.**

You build an artist profile (craft → who you compare to → badges), earn
craft-specific badges that climb **Bronze → Silver → Gold → Diamond** through
**Love** (likes/saves/shares) **+ Proof** (verified paid bookings), get surfaced
in a TikTok-style nearby feed, and **Book Now** with visible escrow. FM takes
**15%**. It's location-first like Tinder.

> This repo implements the foundation of the build spec. See
> **[Build status](#build-status)** for exactly what's wired vs. stubbed.

---

## Stack

| Layer | Tech |
|------|------|
| App | Expo SDK 55 · React Native 0.84 (New Arch) · Expo Router · TypeScript |
| State | TanStack Query (server) · Zustand (local UI) |
| UI/motion | NativeWind · Reanimated 3 · react-native-svg · expo-linear-gradient/blur |
| Geo | react-native-maps · expo-location · PostGIS `ST_DWithin` |
| Backend | Supabase: Postgres + PostGIS + Auth + Realtime + Storage + Edge Functions |
| Security | Row Level Security on **every** table |
| Specialized | Stream (chat) · Stripe Connect + Apple/Google Pay (bookings) · RevenueCat (IAP) · Rekognition + Hive/Thorn (moderation) |

All money logic, moderation, and Stream tokens run in **Edge Functions**. The
app never holds a secret key.

---

## Run it

```bash
npm install
npm start            # Expo dev server — press i / a / w
```

The app ships with bundled **seed data** (founder `@Mulamaxs` + 8 demo artists
in the DC/NoVA metro), so Feed and Discover are alive on first run **with no
backend**. Add Supabase creds to `.env` (see `.env.example`) to switch to the
real Postgres/PostGIS backend — the repository layer (`src/data/repo.ts`)
flips automatically; screens never branch on it.

```bash
npm test             # pure-domain unit tests (badge engine + booking machine)
npm run typecheck    # tsc --noEmit
```

> Tip: on the auth screen, **long-press the footer** to drop straight into the
> seeded `@Mulamaxs` admin account (Diamond everything) for a full-data preview.

### Backend setup

```bash
supabase start
supabase db reset    # applies migrations + seed.sql (badges, founder, demo artists)
supabase functions deploy booking-escrow moderate-upload stream-token
supabase secrets set STRIPE_SECRET_KEY=... STREAM_API_SECRET=...   # etc.
```

---

## Architecture

```
[Expo App] --supabase-js--> [Supabase: Postgres+PostGIS, Auth, Realtime, Storage]
     |                              |
     |                              +--> [Edge Functions] --> Stripe Connect (escrow)
     |                                                   --> Rekognition + Hive (moderation)
     |                                                   --> Stream (chat tokens)
     +--RevenueCat SDK--> [App Store / Play Billing]   (subscriptions, boosts, check)
     +--Stream Chat SDK--> [Stream]                    (DMs)
     +--expo-location-----> device GPS --> PostGIS nearby query
```

### Layout

```
app/                         Expo Router screens
  (onboarding)/              auth → location → profile → craft → comp → badges
  (tabs)/                    feed · discover · create · notifications · me
  profile/[id].tsx           FM card (crest, badges, work, book)
  book/[id].tsx              booking + visible escrow state machine
src/
  domain/                    pure logic — the single source of truth
    types.ts                 schema-mirroring domain types
    badgeEngine.ts           Love + Proof progression, price caps, 15% fee
    booking.ts               escrow state machine + revision/refund bylaws
    badgeCatalog.ts          106 badges across 15 crafts
    crafts.ts                crafts + comp suggestions
  components/                BadgeRing (animated SVG), FeedCard, ArtistCard, …
  data/                      repo (Supabase ↔ seed fallback) + mock seed
  store/                     Zustand: session/onboarding + Love
  lib/                       supabase client, location, formatting
  theme/                     per-tier ring/metal/motion tokens
supabase/
  migrations/                0001_init (schema+PostGIS) · 0002_rls (RLS everywhere)
  seed_badges.sql            generated catalog · seed.sql  founder + demo artists
  functions/                 booking-escrow · moderate-upload · stream-token
```

---

## How the badge engine works (`src/domain/badgeEngine.ts`)

- Tier = **metal + a ring that fills**. **No numbers, no ratings, ever.**
- **Love** (positive engagement only — there is no dislike anywhere) moves you
  Bronze → Silver.
- **Gold and Diamond require verified paid bookings (Proof).** Love alone caps
  at Silver. Diamond needs heavy love **and** 25 verified bookings — it's sacred.
- The ring fill is the **binding constraint** (`min(loveProgress, proofProgress)`)
  so you only advance when both are met.
- Price caps unlock with tier — leveling up literally raises your earning ceiling:

  | Tier | Cap |
  |------|-----|
  | Bronze | $15 |
  | Silver | $40 |
  | Gold | $100 |
  | Diamond | up to $999 |

### Glowing rings (`src/components/BadgeRing.tsx`)
SVG progress circle (animated `strokeDashoffset`) + per-tier motion:
Bronze steady · Silver shimmer · Gold pulse · **Diamond sparkle** (twinkling
particles + breathe). Respects `prefers-reduced-motion`.

---

## Build status

Following the spec's milestone order:

| # | Milestone | Status |
|---|-----------|--------|
| 1 | Foundation (Expo+Router+TS, schema, PostGIS, RLS) | ✅ |
| 2 | Onboarding (auth → GPS/radius → profile → 2K build) + seed | ✅ |
| 3 | Feed + Discover (Love engine, PostGIS radius, FM card) | ✅ |
| 4 | Badge engine + glowing animated rings, caps, Love+Proof | ✅ |
| 5 | Social (Follow + DM via Stream) | 🟡 UI + token fn; Stream SDK to wire |
| 6 | Bookings + escrow (Stripe Connect) + revision bylaws | 🟡 full state machine + UI; Stripe calls TODO in Edge fn |
| 7 | Monetization B (RevenueCat IAP, certified check) | 🟡 entry points + mirror table; SDK to wire |
| 8 | Trust & Safety (Rekognition + Hive/Thorn, NCMEC, dashboard) | 🟡 pipeline Edge fn + reports table; provider calls TODO |
| 9 | Polish + Go Live (livestream, merch, label tools) | ⬜ roadmap |

**Verified:** the pure-domain logic (badge progression, Diamond gating, price
caps, 15% fee, escrow transitions, revision bylaws) is unit-tested and passing.

### Non-negotiables carried through (spec §17)
- No dislikes, no numbers/ratings — tier = metal + ring only.
- Two payment rails kept **separate in code**: real-world = Stripe/Apple Pay
  (`book/[id]`, `booking-escrow`); digital goods = IAP (RevenueCat).
- Moderation + CSAM detection scaffolded from day one (`moderate-upload`).
- Default to real GPS; never hard-code a city.
- RLS on every table; no secrets in the app.

> ⚠️ **Get legal review** of the ToS, refund policy, escrow flow, Stripe Connect
> agreement, and Apple/Google payment compliance before launch.
