import { supabase, supabaseConfigured } from "@/lib/supabase";
import { milesBetween } from "@/lib/location";
import type { GeoPoint, Post, Profile } from "@/domain/types";
import { ALL_SEED_PROFILES, SEED_POSTS, FOUNDER } from "./mock";

// Thin repository layer. When Supabase is configured it hits Postgres/PostGIS;
// otherwise it serves the bundled seed data so Feed + Discover are alive on
// first run with no backend (spec §13/§14). The screens never branch on this.

export async function fetchFeed(): Promise<Post[]> {
  if (!supabaseConfigured) {
    return [...SEED_POSTS].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  const { data, error } = await supabase
    .from("posts")
    .select("*, author:profiles(*)")
    .eq("moderation_status", "approved")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []).map(mapPost);
}

export async function fetchNearby(
  center: GeoPoint,
  radiusMi: number,
  craftFilter: string | null,
): Promise<Profile[]> {
  if (!supabaseConfigured) {
    return ALL_SEED_PROFILES.map((p) => ({
      ...p,
      distanceMi: p.location ? milesBetween(center, p.location) : undefined,
    }))
      .filter((p) => (craftFilter ? p.craft === craftFilter : true))
      .filter((p) => (p.distanceMi ?? Infinity) <= radiusMi)
      .sort((a, b) => (a.distanceMi ?? 0) - (b.distanceMi ?? 0));
  }
  const { data, error } = await supabase.rpc("nearby_artists", {
    lat: center.lat,
    lng: center.lng,
    radius_mi: radiusMi,
    craft_filter: craftFilter,
  });
  if (error) throw error;
  return (data ?? []).map(mapProfile);
}

export async function fetchProfile(id: string): Promise<Profile | null> {
  if (!supabaseConfigured) {
    return ALL_SEED_PROFILES.find((p) => p.id === id) ?? null;
  }
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();
  if (error) return null;
  return mapProfile(data);
}

export function getFounder(): Profile {
  return FOUNDER;
}

export interface ProfileBadge {
  slug: string;
  name: string;
  tier: import("@/domain/types").Tier;
  lovePoints: number;
  verifiedBookings: number;
}

export async function fetchUserBadges(userId: string): Promise<ProfileBadge[]> {
  if (!supabaseConfigured) {
    const seed = ALL_SEED_PROFILES.find((p) => p.id === userId);
    if (!seed) return [];
    return seed.badges.map((b) => ({
      slug: b.slug,
      name: nameFromSlug(b.slug),
      tier: b.tier,
      lovePoints: b.lovePoints,
      verifiedBookings: b.verifiedBookings,
    }));
  }
  const { data, error } = await supabase
    .from("user_badges")
    .select("love_points, verified_bookings, tier, badge:badges(slug, name)")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    slug: r.badge?.slug ?? "",
    name: r.badge?.name ?? "",
    tier: r.tier,
    lovePoints: r.love_points,
    verifiedBookings: r.verified_bookings,
  }));
}

function nameFromSlug(slug: string): string {
  const tail = slug.split(".")[1] ?? slug;
  return tail
    .split("-")
    .map((w) => (w === "and" ? "&" : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

// --- row mappers (snake_case → camelCase domain types) ----------------------
function mapProfile(r: any): Profile {
  return {
    id: r.id,
    handle: r.handle,
    displayName: r.display_name,
    bio: r.bio,
    avatarUrl: r.avatar_url,
    craft: r.craft,
    compArtist: r.comp_artist,
    city: r.city,
    state: r.state,
    location: r.location ?? null,
    radiusMi: r.radius_mi,
    tierOverall: r.tier_overall,
    isVerified: r.is_verified,
    isAdmin: r.is_admin,
    createdAt: r.created_at,
    distanceMi: r.distance_mi,
  };
}

function mapPost(r: any): Post {
  return {
    id: r.id,
    userId: r.user_id,
    imageUrl: r.image_url,
    caption: r.caption,
    craft: r.craft,
    createdAt: r.created_at,
    likeCount: r.like_count,
    saveCount: r.save_count,
    shareCount: r.share_count,
    moderationStatus: r.moderation_status,
    author: r.author ? mapProfile(r.author) : undefined,
  };
}
