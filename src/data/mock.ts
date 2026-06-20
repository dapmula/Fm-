import type { Post, Profile, Tier } from "@/domain/types";
import { badgeSlug } from "@/domain/badgeCatalog";

// Demo/seed data so Feed + Discover are never empty (spec §14). Clustered in
// the DC / Northern Virginia metro, centered on Centreville, VA — the founder's
// real GPS in the example. The app uses this in dev / when Supabase isn't
// configured; the same accounts are mirrored in supabase/seed.sql.

export const FOUNDER_HOME = { lat: 38.841, lng: -77.429 }; // Centreville, VA

// Placeholder AI imagery (spec §13 — images only for v1). Using deterministic
// picsum seeds keeps the demo looking alive without bundling binaries.
const img = (seed: string) => `https://picsum.photos/seed/fm-${seed}/900/1300`;
const avatar = (seed: string) => `https://picsum.photos/seed/fm-av-${seed}/240/240`;

interface SeedUserBadge {
  slug: string;
  tier: Tier;
  lovePoints: number;
  verifiedBookings: number;
}

export interface SeedProfile extends Profile {
  badges: SeedUserBadge[];
}

function profile(p: Omit<SeedProfile, "createdAt">): SeedProfile {
  return { ...p, createdAt: "2026-01-01T00:00:00Z" };
}

// --- Founder: @Mulamaxs — Diamond everything, certified, admin (spec §14) ---
export const FOUNDER: SeedProfile = profile({
  id: "00000000-0000-0000-0000-000000000001",
  handle: "Mulamaxs",
  displayName: "Mula",
  bio: "Founder of Feature Me. Building the home for every artist. 🏆",
  avatarUrl: avatar("mula"),
  craft: "rapper",
  compArtist: "Lil Uzi Vert",
  city: "Centreville",
  state: "VA",
  location: FOUNDER_HOME,
  radiusMi: 25,
  tierOverall: "diamond",
  isVerified: true,
  isAdmin: true,
  badges: [
    { slug: badgeSlug("rapper", "Golden Voice"), tier: "diamond", lovePoints: 20000, verifiedBookings: 40 },
    { slug: badgeSlug("rapper", "Lyrical Pen"), tier: "diamond", lovePoints: 20000, verifiedBookings: 40 },
    { slug: badgeSlug("rapper", "Steady Flow"), tier: "diamond", lovePoints: 20000, verifiedBookings: 40 },
    { slug: badgeSlug("rapper", "Crowd Mover"), tier: "diamond", lovePoints: 20000, verifiedBookings: 40 },
  ],
});

export const DEMO_ARTISTS: SeedProfile[] = [
  profile({
    id: "00000000-0000-0000-0000-000000000002",
    handle: "novasinger",
    displayName: "Aria Bell",
    bio: "R&B vocalist. Runs for days.",
    avatarUrl: avatar("aria"),
    craft: "singer",
    compArtist: "SZA",
    city: "Fairfax",
    state: "VA",
    location: { lat: 38.846, lng: -77.306 },
    radiusMi: 25,
    tierOverall: "gold",
    isVerified: true,
    isAdmin: false,
    badges: [
      { slug: badgeSlug("singer", "Golden Voice"), tier: "gold", lovePoints: 4200, verifiedBookings: 5 },
      { slug: badgeSlug("singer", "Runs & Riffs"), tier: "silver", lovePoints: 900, verifiedBookings: 1 },
    ],
  }),
  profile({
    id: "00000000-0000-0000-0000-000000000003",
    handle: "808dmv",
    displayName: "Trey Banks",
    bio: "Producer. 808s that knock.",
    avatarUrl: avatar("trey"),
    craft: "producer",
    compArtist: "Metro Boomin",
    city: "Arlington",
    state: "VA",
    location: { lat: 38.88, lng: -77.1 },
    radiusMi: 30,
    tierOverall: "silver",
    isVerified: false,
    isAdmin: false,
    badges: [
      { slug: badgeSlug("producer", "808 Architect"), tier: "silver", lovePoints: 1100, verifiedBookings: 0 },
      { slug: badgeSlug("producer", "Melody Maker"), tier: "bronze", lovePoints: 220, verifiedBookings: 0 },
    ],
  }),
  profile({
    id: "00000000-0000-0000-0000-000000000004",
    handle: "shotbykai",
    displayName: "Kai Monroe",
    bio: "Photographer. Golden hour specialist.",
    avatarUrl: avatar("kai"),
    craft: "photographer",
    compArtist: "Cam Kirk",
    city: "Washington",
    state: "DC",
    location: { lat: 38.907, lng: -77.037 },
    radiusMi: 20,
    tierOverall: "gold",
    isVerified: true,
    isAdmin: false,
    badges: [
      { slug: badgeSlug("photographer", "Golden Hour"), tier: "gold", lovePoints: 3800, verifiedBookings: 4 },
      { slug: badgeSlug("photographer", "Portrait"), tier: "silver", lovePoints: 700, verifiedBookings: 2 },
    ],
  }),
  profile({
    id: "00000000-0000-0000-0000-000000000005",
    handle: "lensgod",
    displayName: "Dom Rivera",
    bio: "Music video director. One-take energy.",
    avatarUrl: avatar("dom"),
    craft: "videographer",
    compArtist: "Cole Bennett",
    city: "Alexandria",
    state: "VA",
    location: { lat: 38.805, lng: -77.047 },
    radiusMi: 35,
    tierOverall: "silver",
    isVerified: false,
    isAdmin: false,
    badges: [
      { slug: badgeSlug("videographer", "Cinematic Eye"), tier: "silver", lovePoints: 1300, verifiedBookings: 1 },
    ],
  }),
  profile({
    id: "00000000-0000-0000-0000-000000000006",
    handle: "jadewalks",
    displayName: "Jade Lin",
    bio: "Model. Editorial + runway.",
    avatarUrl: avatar("jade"),
    craft: "model",
    compArtist: "Adut Akech",
    city: "Bethesda",
    state: "MD",
    location: { lat: 38.984, lng: -77.094 },
    radiusMi: 25,
    tierOverall: "bronze",
    isVerified: false,
    isAdmin: false,
    badges: [
      { slug: badgeSlug("model", "Golden Smile"), tier: "bronze", lovePoints: 140, verifiedBookings: 0 },
    ],
  }),
  profile({
    id: "00000000-0000-0000-0000-000000000007",
    handle: "fadeking",
    displayName: "Marcus Cole",
    bio: "Barber. Cleanest fades in NoVA.",
    avatarUrl: avatar("marcus"),
    craft: "barber",
    compArtist: "Vic Blends",
    city: "Manassas",
    state: "VA",
    location: { lat: 38.751, lng: -77.475 },
    radiusMi: 15,
    tierOverall: "gold",
    isVerified: true,
    isAdmin: false,
    badges: [
      { slug: badgeSlug("barber", "Fade Master"), tier: "gold", lovePoints: 5200, verifiedBookings: 8 },
    ],
  }),
  profile({
    id: "00000000-0000-0000-0000-000000000008",
    handle: "djspinz",
    displayName: "Nikki Spin",
    bio: "Open-format DJ. I read the room.",
    avatarUrl: avatar("nikki"),
    craft: "dj",
    compArtist: "Kaytranada",
    city: "Reston",
    state: "VA",
    location: { lat: 38.958, lng: -77.357 },
    radiusMi: 40,
    tierOverall: "silver",
    isVerified: false,
    isAdmin: false,
    badges: [
      { slug: badgeSlug("dj", "Crowd Read"), tier: "silver", lovePoints: 800, verifiedBookings: 1 },
    ],
  }),
  profile({
    id: "00000000-0000-0000-0000-000000000009",
    handle: "youngflow",
    displayName: "Zo",
    bio: "Rapper. Punchlines for days.",
    avatarUrl: avatar("zo"),
    craft: "rapper",
    compArtist: "J. Cole",
    city: "Centreville",
    state: "VA",
    location: { lat: 38.84, lng: -77.44 },
    radiusMi: 25,
    tierOverall: "bronze",
    isVerified: false,
    isAdmin: false,
    badges: [
      { slug: badgeSlug("rapper", "Punchline"), tier: "bronze", lovePoints: 300, verifiedBookings: 0 },
    ],
  }),
];

export const ALL_SEED_PROFILES: SeedProfile[] = [FOUNDER, ...DEMO_ARTISTS];

export const SEED_POSTS: Post[] = ALL_SEED_PROFILES.flatMap((p, i) => {
  const count = p.id === FOUNDER.id ? 3 : 2;
  return Array.from({ length: count }).map((_, j) => ({
    id: `post-${i}-${j}`,
    userId: p.id,
    imageUrl: img(`${p.handle}-${j}`),
    caption: postCaption(p.craft, j),
    craft: p.craft,
    createdAt: `2026-06-${String(10 + i).padStart(2, "0")}T12:0${j}:00Z`,
    likeCount: 40 + ((i * 37 + j * 13) % 900),
    saveCount: 5 + ((i * 11 + j * 7) % 120),
    shareCount: 2 + ((i * 5 + j * 3) % 60),
    moderationStatus: "approved" as const,
    author: p,
    likedByMe: false,
    savedByMe: false,
  }));
});

function postCaption(craft: string, j: number): string {
  const lines: Record<string, string[]> = {
    rapper: ["New verse dropping 🔥", "Studio nights", "Who wants a feature?"],
    singer: ["Late night runs 🎶", "New cover up now", "Vocals only"],
    producer: ["This beat is for sale 🎛️", "808 season", "Tag me on the placement"],
    photographer: ["Golden hour magic 📷", "Studio session", "Book me for your next shoot"],
    videographer: ["One-take visuals 🎥", "New video out", "Let's shoot"],
    model: ["Editorial look 💫", "On set today", "Book me"],
    barber: ["Clean fade ✂️", "Walk-ins welcome", "Before / after"],
    dj: ["Last night was crazy 🎧", "New mix up", "Book me for your event"],
  };
  const arr = lines[craft] ?? ["New work up", "Booking now"];
  return arr[j % arr.length];
}
