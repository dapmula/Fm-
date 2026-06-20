import type { Tier } from "@/domain/types";

// Per-tier visual tokens for crests/rings (spec §6). Tier is communicated by
// METAL + RING only — never numbers or ratings.
export type TierMotion = "steady" | "shimmer" | "pulse" | "sparkle";

export interface TierStyle {
  label: string;
  // Ring gradient stops (start → end).
  ring: [string, string];
  glow: string;
  metal: string;
  motion: TierMotion;
}

export const TIER_STYLES: Record<Tier, TierStyle> = {
  bronze: {
    label: "Bronze",
    ring: ["#CD7F32", "#E6A857"],
    glow: "#CD7F32",
    metal: "#CD7F32",
    motion: "steady",
  },
  silver: {
    label: "Silver",
    ring: ["#9AA3AF", "#E8EDF4"],
    glow: "#C0C7D1",
    metal: "#C0C7D1",
    motion: "shimmer",
  },
  gold: {
    label: "Gold",
    ring: ["#FFB300", "#FFE16B"],
    glow: "#FFC83D",
    metal: "#FFC83D",
    motion: "pulse",
  },
  diamond: {
    label: "Diamond",
    ring: ["#8FE3FF", "#E7C8FF"],
    glow: "#9FE7FF",
    metal: "#BFF0FF",
    motion: "sparkle",
  },
};

export function tierStyle(tier: Tier): TierStyle {
  return TIER_STYLES[tier];
}
