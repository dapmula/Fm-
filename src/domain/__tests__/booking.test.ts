import {
  canTransition,
  canRequestRevision,
  canOpenDispute,
  clampRevisionsAllowed,
  validateBooking,
} from "../booking";

describe("booking state machine + bylaws (spec §8)", () => {
  test("legal escrow transitions", () => {
    expect(canTransition("accepted", "funded")).toBe(true);
    expect(canTransition("funded", "in_progress")).toBe(true);
    expect(canTransition("delivered", "completed")).toBe(true);
    expect(canTransition("delivered", "revision")).toBe(true);
    expect(canTransition("disputed", "refunded")).toBe(true);
  });

  test("illegal transitions are rejected", () => {
    expect(canTransition("requested", "completed")).toBe(false);
    expect(canTransition("completed", "refunded")).toBe(false);
    expect(canTransition("refunded", "completed")).toBe(false);
  });

  test("revisions are bounded by the included count", () => {
    expect(canRequestRevision("delivered", 2, 0)).toBe(true);
    expect(canRequestRevision("delivered", 2, 2)).toBe(false);
    expect(canRequestRevision("funded", 2, 0)).toBe(false);
  });

  test("dispute opens only after included revisions are exhausted", () => {
    expect(canOpenDispute("delivered", 1, 0)).toBe(false);
    expect(canOpenDispute("delivered", 1, 1)).toBe(true);
    expect(canOpenDispute("in_progress", 1, 0)).toBe(true);
  });

  test("non-Gold artists must include at least 1 revision", () => {
    expect(clampRevisionsAllowed("bronze", 0)).toBe(1);
    expect(clampRevisionsAllowed("silver", 0)).toBe(1);
    expect(clampRevisionsAllowed("gold", 0)).toBe(0);
    expect(clampRevisionsAllowed("bronze", 5)).toBe(3);
  });

  test("validateBooking enforces cap + self-book guard", () => {
    expect(validateBooking({ clientId: "a", artistId: "a", artistTier: "gold", amountCents: 5000, revisionsAllowed: 1 }).ok).toBe(false);
    expect(validateBooking({ clientId: "a", artistId: "b", artistTier: "bronze", amountCents: 5000, revisionsAllowed: 1 }).ok).toBe(false);
    const ok = validateBooking({ clientId: "a", artistId: "b", artistTier: "gold", amountCents: 7500, revisionsAllowed: 2 });
    expect(ok.ok).toBe(true);
    expect(ok.feeCents).toBe(1125);
  });
});
