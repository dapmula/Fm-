// Core domain types for Feature Me.
// These mirror the Postgres schema in supabase/migrations and are the single
// source of truth the app and Edge Functions both code against.

export type Tier = "bronze" | "silver" | "gold" | "diamond";

export const TIERS: Tier[] = ["bronze", "silver", "gold", "diamond"];

// Crafts a creator can build a profile around (spec §4).
export type Craft =
  | "rapper"
  | "singer"
  | "producer"
  | "photographer"
  | "videographer"
  | "model"
  | "barber"
  | "dj"
  | "dancer"
  | "actor"
  | "graphic_designer"
  | "makeup_artist"
  | "tattoo_artist"
  | "writer"
  | "fashion";

export type EngagementType = "like" | "save" | "share";

// Full booking/escrow state machine (spec §8).
export type BookingStatus =
  | "requested"
  | "accepted"
  | "funded"
  | "in_progress"
  | "delivered"
  | "revision"
  | "completed"
  | "disputed"
  | "refunded"
  | "cancelled";

export type ModerationStatus = "pending" | "approved" | "blocked";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Profile {
  id: string;
  handle: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  craft: Craft;
  compArtist: string | null;
  city: string | null;
  state: string | null;
  location: GeoPoint | null;
  radiusMi: number;
  tierOverall: Tier;
  isVerified: boolean;
  isAdmin: boolean;
  createdAt: string;
  // Derived/joined for display, not stored on the row.
  distanceMi?: number;
}

export interface BadgeDef {
  id: string;
  craft: Craft;
  name: string;
  slug: string;
  description: string;
  iconKey: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  tier: Tier;
  lovePoints: number;
  verifiedBookings: number;
  progressPct: number; // 0-100, progress toward the NEXT tier
  updatedAt: string;
  // Joined catalog info for rendering.
  def?: BadgeDef;
}

export interface Post {
  id: string;
  userId: string;
  imageUrl: string;
  caption: string | null;
  craft: Craft;
  createdAt: string;
  likeCount: number;
  saveCount: number;
  shareCount: number;
  moderationStatus: ModerationStatus;
  // Joined for the feed.
  author?: Profile;
  likedByMe?: boolean;
  savedByMe?: boolean;
}

export interface Engagement {
  id: string;
  postId: string;
  userId: string;
  type: EngagementType;
  weight: number; // reputation-weighted, invisible to users (spec §6)
  createdAt: string;
}

export interface Booking {
  id: string;
  clientId: string;
  artistId: string;
  badgeContext: string | null;
  tier: Tier;
  amountCents: number;
  feeCents: number; // 15% of amountCents
  status: BookingStatus;
  revisionsAllowed: number; // 1-3
  revisionsUsed: number;
  scheduledFor: string | null;
  stripePaymentIntent: string | null;
  stripeTransferId: string | null;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: "post" | "profile" | "message";
  targetId: string;
  reason: string;
  status: "open" | "reviewing" | "actioned" | "dismissed";
  createdAt: string;
}
