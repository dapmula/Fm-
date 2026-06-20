import { create } from "zustand";
import type { Craft, GeoPoint, Profile } from "@/domain/types";
import { DEFAULT_RADIUS_MI } from "@/lib/location";

// Local session + onboarding draft. Server state lives in React Query; this is
// purely UI/local state (spec §1 — Zustand for local, React Query for server).

export interface OnboardingDraft {
  displayName: string;
  handle: string;
  avatarUrl: string | null;
  bio: string;
  craft: Craft | null;
  compArtist: string | null;
  badgeSlugs: string[];
  location: GeoPoint | null;
  city: string | null;
  state: string | null;
  radiusMi: number;
}

interface SessionState {
  // Auth / current user.
  me: Profile | null;
  isAdminPreview: boolean;
  setMe: (p: Profile | null) => void;
  enterAdminPreview: (founder: Profile) => void;

  // Discovery radius (set on login, changeable anytime — spec §4/§12).
  radiusMi: number;
  setRadius: (mi: number) => void;

  // Onboarding draft assembled across the 2K-build screens.
  draft: OnboardingDraft;
  patchDraft: (patch: Partial<OnboardingDraft>) => void;
  resetDraft: () => void;
}

const emptyDraft: OnboardingDraft = {
  displayName: "",
  handle: "",
  avatarUrl: null,
  bio: "",
  craft: null,
  compArtist: null,
  badgeSlugs: [],
  location: null,
  city: null,
  state: null,
  radiusMi: DEFAULT_RADIUS_MI,
};

export const useSession = create<SessionState>((set) => ({
  me: null,
  isAdminPreview: false,
  setMe: (p) => set({ me: p }),
  enterAdminPreview: (founder) =>
    set({ me: founder, isAdminPreview: true, radiusMi: founder.radiusMi }),

  radiusMi: DEFAULT_RADIUS_MI,
  setRadius: (mi) => set({ radiusMi: mi }),

  draft: emptyDraft,
  patchDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
  resetDraft: () => set({ draft: emptyDraft }),
}));
