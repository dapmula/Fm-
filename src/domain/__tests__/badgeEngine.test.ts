import {
  computeProgress,
  isPriceWithinCap,
  feeCents,
  remainingToNext,
  PRICE_CAP_CENTS,
} from "../badgeEngine";

describe("badge engine — Love + Proof progression (spec §6)", () => {
  test("everyone starts Bronze with no love", () => {
    const p = computeProgress(0, 0);
    expect(p.current).toBe("bronze");
    expect(p.next).toBe("silver");
    expect(p.fraction).toBe(0);
  });

  test("Love alone can reach Silver", () => {
    const p = computeProgress(600, 0);
    expect(p.current).toBe("silver");
  });

  test("Love alone can NOT reach Gold — Proof is required", () => {
    // Past the Gold love threshold but with zero verified bookings.
    const p = computeProgress(5000, 0);
    expect(p.current).toBe("silver");
    expect(p.blockedOnProof).toBe(true);
  });

  test("Gold requires verified paid bookings", () => {
    const p = computeProgress(5000, 3);
    expect(p.current).toBe("gold");
  });

  test("Diamond is sacred — needs heavy love AND many bookings", () => {
    expect(computeProgress(12000, 10).current).toBe("gold"); // not enough proof
    expect(computeProgress(12000, 25).current).toBe("diamond");
  });

  test("ring fill is the binding constraint (min of love/proof)", () => {
    // Halfway on love toward gold, but no proof at all → fraction 0.
    const p = computeProgress(1500, 0);
    expect(p.current).toBe("silver");
    expect(p.fraction).toBe(0);
  });

  test("remainingToNext reports what's left", () => {
    const rem = remainingToNext(0, 0);
    expect(rem?.tier).toBe("silver");
    expect(rem?.loveLeft).toBe(500);
  });
});

describe("price caps + fee (spec §6/§8)", () => {
  test("caps escalate by tier", () => {
    expect(PRICE_CAP_CENTS.bronze).toBe(1500);
    expect(PRICE_CAP_CENTS.silver).toBe(4000);
    expect(PRICE_CAP_CENTS.diamond).toBeLessThan(100000); // under $1,000
  });

  test("price is rejected above the tier cap", () => {
    expect(isPriceWithinCap("bronze", 1500)).toBe(true);
    expect(isPriceWithinCap("bronze", 1600)).toBe(false);
    expect(isPriceWithinCap("diamond", 99900)).toBe(true);
  });

  test("FM takes 15%", () => {
    expect(feeCents(10000)).toBe(1500);
  });
});
