import { create } from "zustand";
import type { EngagementType } from "@/domain/types";

// Optimistic local Love state for the feed. Likes/saves/shares are positive
// only — there is NO dislike mechanic anywhere (spec §17). When a post is
// liked, the author's badge ring ticks up (the Love → Proof engine, spec §6);
// the visual bump is derived from this store on the profile card.

interface LoveState {
  liked: Record<string, boolean>;
  saved: Record<string, boolean>;
  // Extra love attributed to an author this session, for the live ring bump.
  authorLoveBump: Record<string, number>;

  toggle: (postId: string, authorId: string, type: EngagementType) => void;
  isLiked: (postId: string) => boolean;
  isSaved: (postId: string) => boolean;
  bumpFor: (authorId: string) => number;
}

// Each engagement type carries Love weight (reputation weighting happens
// server-side and is invisible; this is just the optimistic client bump).
const LOVE_WEIGHT: Record<EngagementType, number> = {
  like: 5,
  save: 8,
  share: 12,
};

export const useLove = create<LoveState>((set, get) => ({
  liked: {},
  saved: {},
  authorLoveBump: {},

  toggle: (postId, authorId, type) =>
    set((s) => {
      const map = type === "save" ? { ...s.saved } : { ...s.liked };
      const wasOn = map[postId] ?? false;
      const delta = wasOn ? -LOVE_WEIGHT[type] : LOVE_WEIGHT[type];
      // share is fire-and-forget (always positive), like/save toggle.
      if (type === "share") {
        return {
          authorLoveBump: bump(s.authorLoveBump, authorId, LOVE_WEIGHT.share),
        };
      }
      map[postId] = !wasOn;
      return {
        ...(type === "save" ? { saved: map } : { liked: map }),
        authorLoveBump: bump(s.authorLoveBump, authorId, delta),
      };
    }),

  isLiked: (postId) => get().liked[postId] ?? false,
  isSaved: (postId) => get().saved[postId] ?? false,
  bumpFor: (authorId) => get().authorLoveBump[authorId] ?? 0,
}));

function bump(map: Record<string, number>, id: string, delta: number) {
  return { ...map, [id]: Math.max(0, (map[id] ?? 0) + delta) };
}
