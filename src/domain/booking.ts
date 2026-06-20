import type { BookingStatus, Tier } from "./types";
import { feeCents, isPriceWithinCap } from "./badgeEngine";

// Booking + escrow state machine (spec §8). Stripe has no legal "escrow", so
// we replicate it with separate charges + transfers and manual payouts: funds
// are HELD by the platform and only released on approval. This module owns the
// allowed transitions; the actual money moves live in Edge Functions.

export const ESCROW_HELD_STATES: BookingStatus[] = [
  "funded",
  "in_progress",
  "delivered",
  "revision",
  "disputed",
];

// Legal next-states for each status. Anything not listed is rejected.
const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  requested: ["accepted", "cancelled"],
  accepted: ["funded", "cancelled"],
  funded: ["in_progress", "cancelled", "refunded"],
  in_progress: ["delivered", "disputed"],
  delivered: ["completed", "revision", "disputed"],
  revision: ["delivered", "disputed"],
  completed: [],
  disputed: ["refunded", "completed"], // platform review releases or refunds
  refunded: [],
  cancelled: [],
};

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function isEscrowHeld(status: BookingStatus): boolean {
  return ESCROW_HELD_STATES.includes(status);
}

// Whether a client may still request a revision, per the bylaws (spec §8):
// each artist includes 1–3 revisions; client can request up to that count.
export function canRequestRevision(
  status: BookingStatus,
  revisionsAllowed: number,
  revisionsUsed: number,
): boolean {
  return status === "delivered" && revisionsUsed < revisionsAllowed;
}

// After included revisions are exhausted and the work still isn't up to normal
// professional standard, the client may open a dispute.
export function canOpenDispute(
  status: BookingStatus,
  revisionsAllowed: number,
  revisionsUsed: number,
): boolean {
  if (status === "in_progress" || status === "revision") return true;
  if (status === "delivered") return revisionsUsed >= revisionsAllowed;
  return false;
}

// Minimum revisions an artist MUST include. Gold+ artists may set their own
// minimum; everyone below must include at least 1 (spec §8).
export function minRevisionsFor(tier: Tier): number {
  return tier === "gold" || tier === "diamond" ? 0 : 1;
}

export function clampRevisionsAllowed(tier: Tier, requested: number): number {
  const min = minRevisionsFor(tier);
  return Math.min(3, Math.max(min, requested));
}

export interface NewBookingInput {
  clientId: string;
  artistId: string;
  artistTier: Tier;
  amountCents: number;
  revisionsAllowed: number;
  badgeContext?: string | null;
  scheduledFor?: string | null;
}

export interface ValidatedBooking {
  ok: boolean;
  error?: string;
  amountCents?: number;
  feeCents?: number;
  revisionsAllowed?: number;
}

// Validate a booking request before any money is touched. Enforces the tier
// price cap and the revision bylaws.
export function validateBooking(input: NewBookingInput): ValidatedBooking {
  if (input.clientId === input.artistId) {
    return { ok: false, error: "You can't book yourself." };
  }
  if (!isPriceWithinCap(input.artistTier, input.amountCents)) {
    return { ok: false, error: `Price exceeds the ${input.artistTier} tier cap.` };
  }
  const revisionsAllowed = clampRevisionsAllowed(input.artistTier, input.revisionsAllowed);
  return {
    ok: true,
    amountCents: input.amountCents,
    feeCents: feeCents(input.amountCents),
    revisionsAllowed,
  };
}

// Human-readable, money-visible status copy shown to BOTH parties (spec §8).
export const STATUS_COPY: Record<BookingStatus, { label: string; blurb: string }> = {
  requested: { label: "Requested", blurb: "Waiting for the artist to accept." },
  accepted: { label: "Accepted", blurb: "Fund the booking to start. Money is held in escrow." },
  funded: { label: "Funds secured", blurb: "Money is held in escrow. Work can begin." },
  in_progress: { label: "In progress", blurb: "Artist is working. Funds stay secured." },
  delivered: { label: "Delivered", blurb: "Review the work. Approve to release, or request a revision." },
  revision: { label: "Revision", blurb: "Artist is reworking the delivery." },
  completed: { label: "Completed", blurb: "Escrow released to the artist. FM kept 15%." },
  disputed: { label: "Disputed", blurb: "Under platform review. Funds stay held until resolved." },
  refunded: { label: "Refunded", blurb: "Escrow returned to the client." },
  cancelled: { label: "Cancelled", blurb: "Booking cancelled. No funds moved." },
};
