import type { GeoPoint } from "@/domain/types";

// Fallback city list for when GPS is denied (spec §12). A complete US dataset
// (or Places autocomplete) is wired in production; this curated set covers
// major metros + the DC/NoVA cluster so the demo and tests work offline.
// We never hard-code a *default* city — this is only used on explicit pick.

export interface USCity {
  city: string;
  state: string;
  point: GeoPoint;
}

export const US_CITIES: USCity[] = [
  { city: "Centreville", state: "VA", point: { lat: 38.841, lng: -77.429 } },
  { city: "Fairfax", state: "VA", point: { lat: 38.846, lng: -77.306 } },
  { city: "Arlington", state: "VA", point: { lat: 38.88, lng: -77.1 } },
  { city: "Alexandria", state: "VA", point: { lat: 38.805, lng: -77.047 } },
  { city: "Manassas", state: "VA", point: { lat: 38.751, lng: -77.475 } },
  { city: "Reston", state: "VA", point: { lat: 38.958, lng: -77.357 } },
  { city: "Washington", state: "DC", point: { lat: 38.907, lng: -77.037 } },
  { city: "Bethesda", state: "MD", point: { lat: 38.984, lng: -77.094 } },
  { city: "Baltimore", state: "MD", point: { lat: 39.29, lng: -76.612 } },
  { city: "Richmond", state: "VA", point: { lat: 37.541, lng: -77.436 } },
  { city: "New York", state: "NY", point: { lat: 40.713, lng: -74.006 } },
  { city: "Brooklyn", state: "NY", point: { lat: 40.678, lng: -73.944 } },
  { city: "Atlanta", state: "GA", point: { lat: 33.749, lng: -84.388 } },
  { city: "Los Angeles", state: "CA", point: { lat: 34.052, lng: -118.244 } },
  { city: "Chicago", state: "IL", point: { lat: 41.878, lng: -87.63 } },
  { city: "Houston", state: "TX", point: { lat: 29.76, lng: -95.37 } },
  { city: "Miami", state: "FL", point: { lat: 25.762, lng: -80.192 } },
  { city: "Philadelphia", state: "PA", point: { lat: 39.953, lng: -75.165 } },
  { city: "Detroit", state: "MI", point: { lat: 42.331, lng: -83.046 } },
  { city: "Memphis", state: "TN", point: { lat: 35.149, lng: -90.049 } },
  { city: "Dallas", state: "TX", point: { lat: 32.777, lng: -96.797 } },
  { city: "Seattle", state: "WA", point: { lat: 47.606, lng: -122.332 } },
];

export function searchCities(q: string): USCity[] {
  const s = q.trim().toLowerCase();
  if (!s) return US_CITIES.slice(0, 12);
  return US_CITIES.filter(
    (c) => c.city.toLowerCase().includes(s) || c.state.toLowerCase() === s,
  ).slice(0, 20);
}
