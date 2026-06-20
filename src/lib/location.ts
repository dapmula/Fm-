import * as Location from "expo-location";
import type { GeoPoint } from "@/domain/types";

export interface ResolvedLocation {
  point: GeoPoint;
  city: string | null;
  state: string | null;
}

// Default radius set the moment you log in, Tinder-style (spec §4/§12).
export const DEFAULT_RADIUS_MI = 25;

// Request GPS and reverse-geocode to city/state. We NEVER hard-code a city
// (spec §17) — if GPS is denied the caller falls back to the manual US picker.
export async function getCurrentLocation(): Promise<ResolvedLocation | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") return null;

  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  const point: GeoPoint = {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
  };

  let city: string | null = null;
  let state: string | null = null;
  try {
    const [place] = await Location.reverseGeocodeAsync(point as any);
    if (place) {
      city = place.city ?? place.subregion ?? null;
      state = place.region ?? null;
    }
  } catch {
    // Reverse geocode is best-effort; coordinates still work for discovery.
  }

  return { point, city, state };
}

export function milesBetween(a: GeoPoint, b: GeoPoint): number {
  const R = 3958.8; // earth radius in miles
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

function toRad(d: number): number {
  return (d * Math.PI) / 180;
}
