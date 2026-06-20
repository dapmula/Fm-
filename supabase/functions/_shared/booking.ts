// Deno-side copy of the booking transition rules used by Edge Functions. Kept
// in sync with src/domain/booking.ts (the app-side source of truth, spec §8).

export type BookingStatus =
  | "requested" | "accepted" | "funded" | "in_progress" | "delivered"
  | "revision" | "completed" | "disputed" | "refunded" | "cancelled";

const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  requested: ["accepted", "cancelled"],
  accepted: ["funded", "cancelled"],
  funded: ["in_progress", "cancelled", "refunded"],
  in_progress: ["delivered", "disputed"],
  delivered: ["completed", "revision", "disputed"],
  revision: ["delivered", "disputed"],
  completed: [],
  disputed: ["refunded", "completed"],
  refunded: [],
  cancelled: [],
};

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}
