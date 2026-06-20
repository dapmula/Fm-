import { priceCapCents } from "@/domain/badgeEngine";
import type { Tier } from "@/domain/types";

export function formatPrice(cents: number): string {
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

export function formatCap(tier: Tier): string {
  return formatPrice(priceCapCents(tier));
}

export function formatDistance(mi: number | undefined): string {
  if (mi == null) return "";
  if (mi < 0.1) return "here";
  if (mi < 10) return `${mi.toFixed(1)} mi`;
  return `${Math.round(mi)} mi`;
}

export function compactCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0)}k`;
  return `${(n / 1_000_000).toFixed(1)}m`;
}
