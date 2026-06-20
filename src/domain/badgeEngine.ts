import type { Tier } from "./types";
import { TIERS } from "./types";

// The badge engine encodes the Love + Proof progression rules (spec §6).
// Non-negotiables enforced here:
//   - Love alone can only reach Silver. Gold and Diamond REQUIRE verified
//     paid bookings (Proof). Diamond is sacred.
//   - No numbers/ratings are ever shown to users; this module returns a tier
//     and a 0-1 progress fraction the ring renders, never a score.

// Love points required to reach each tier (cumulative).
export const LOVE_THRESHOLDS: Record<Tier, number> = {
  bronze: 0,
  silver: 500,
  gold: 2500,
  diamond: 12000,
};

// Verified paid bookings (Proof) required to reach each tier. Bronze/Silver
// need none — Love alone gets you there. Gold and Diamond gate on Proof.
export const PROOF_THRESHOLDS: Record<Tier, number> = {
  bronze: 0,
  silver: 0,
  gold: 3,
  diamond: 25,
};

// Price caps per tier, in cents (spec §6). Leveling up literally raises the
// earning ceiling. Diamond is "up to $999" — kept strictly under $1,000.
export const PRICE_CAP_CENTS: Record<Tier, number> = {
  bronze: 1500, // $15
  silver: 4000, // $40
  gold: 10000, // $75–$100 band; cap at $100
  diamond: 99900, // up to $999
};

export const FM_FEE_RATE = 0.15; // FM takes 15% of every booking.

export function feeCents(amountCents: number): number {
  return Math.round(amountCents * FM_FEE_RATE);
}

export function nextTier(tier: Tier): Tier | null {
  const i = TIERS.indexOf(tier);
  return i >= 0 && i < TIERS.length - 1 ? TIERS[i + 1] : null;
}

export function tierIndex(tier: Tier): number {
  return TIERS.indexOf(tier);
}

export interface BadgeProgress {
  current: Tier;
  next: Tier | null;
  // 0..1 fill for the ring toward the next tier (1 at max tier).
  fraction: number;
  // True when Love is maxed for this rung but Proof is the only thing missing.
  blockedOnProof: boolean;
}

// Given accrued Love + verified bookings, compute the held tier and the ring
// fill toward the next one. This is intentionally pure and unit-testable.
export function computeProgress(lovePoints: number, verifiedBookings: number): BadgeProgress {
  // Highest tier whose Love AND Proof thresholds are both satisfied.
  let current: Tier = "bronze";
  for (const tier of TIERS) {
    if (lovePoints >= LOVE_THRESHOLDS[tier] && verifiedBookings >= PROOF_THRESHOLDS[tier]) {
      current = tier;
    }
  }

  const next = nextTier(current);
  if (!next) {
    return { current, next: null, fraction: 1, blockedOnProof: false };
  }

  const loveFloor = LOVE_THRESHOLDS[current];
  const loveCeil = LOVE_THRESHOLDS[next];
  const loveSpan = Math.max(1, loveCeil - loveFloor);
  const loveFraction = clamp01((lovePoints - loveFloor) / loveSpan);

  const proofNeeded = PROOF_THRESHOLDS[next];
  const proofFraction = proofNeeded === 0 ? 1 : clamp01(verifiedBookings / proofNeeded);

  // The ring shows the binding constraint — you advance only when BOTH are met,
  // so the fill is the minimum of the two requirements' progress.
  const fraction = Math.min(loveFraction, proofFraction);
  const blockedOnProof = loveFraction >= 1 && proofFraction < 1;

  return { current, next, fraction, blockedOnProof };
}

// What's left to reach the next tier — used for "climb from Bronze" copy.
export function remainingToNext(
  lovePoints: number,
  verifiedBookings: number,
): { tier: Tier; loveLeft: number; proofLeft: number } | null {
  const { current, next } = computeProgress(lovePoints, verifiedBookings);
  if (!next) return null;
  return {
    tier: next,
    loveLeft: Math.max(0, LOVE_THRESHOLDS[next] - lovePoints),
    proofLeft: Math.max(0, PROOF_THRESHOLDS[next] - verifiedBookings),
  };
}

export function priceCapCents(tier: Tier): number {
  return PRICE_CAP_CENTS[tier];
}

// Validate a creator's asking price against their tier cap (spec §6 + §8).
export function isPriceWithinCap(tier: Tier, amountCents: number): boolean {
  return amountCents > 0 && amountCents <= PRICE_CAP_CENTS[tier];
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}
