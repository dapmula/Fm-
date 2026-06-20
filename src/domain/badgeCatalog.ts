import type { Craft } from "./types";

// The full badge catalog (spec §8). Every badge exists in all four metals;
// the tier is tracked per user in user_badges, not here. This is the catalog
// of *which* badges exist for each craft.
//
// slug is `${craft}.${kebab(name)}` and is stable — it's the join key used by
// seed data and the Edge Functions, so do not rename existing slugs.

export interface CatalogEntry {
  craft: Craft;
  names: string[];
}

export const BADGE_CATALOG: CatalogEntry[] = [
  {
    craft: "rapper",
    names: ["Golden Voice", "Lyrical Pen", "Steady Flow", "Punchline", "Freestyle", "Storyteller", "Breath Control", "Crowd Mover"],
  },
  {
    craft: "singer",
    names: ["Golden Voice", "Range", "Runs & Riffs", "Falsetto", "Harmony", "Songbird", "Ad-Lib", "Pitch Perfect"],
  },
  {
    craft: "producer",
    names: ["Crate Digger", "808 Architect", "Sample Surgeon", "Melody Maker", "Drum Programmer", "Mixdown", "Hitmaker", "Loop Lord"],
  },
  {
    craft: "photographer",
    names: ["Golden Eye", "Golden Hour", "Studio Light", "Portrait", "Street", "Editorial", "Retoucher", "Fast Shutter"],
  },
  {
    craft: "videographer",
    names: ["Cinematic Eye", "Color Grade", "One-Take", "Drone", "Music Video", "Editor", "B-Roll", "Documentary"],
  },
  {
    craft: "model",
    names: ["Golden Smile", "Pose Striker", "Runway Walk", "Editorial Look", "Expression", "Commercial", "Fitness", "Print"],
  },
  {
    craft: "barber",
    names: ["Golden Steady Hand", "Fade Master", "Line-Up", "Design Cut", "Speed", "Beard Sculptor"],
  },
  {
    craft: "dj",
    names: ["Beatmatch", "Crowd Read", "Scratch", "Transition", "Set Builder", "Open Format"],
  },
  {
    craft: "dancer",
    names: ["Footwork", "Freestyle", "Choreographer", "In Sync", "Flexibility", "Battle Tested"],
  },
  {
    craft: "actor",
    names: ["Range", "Improv", "Monologue", "Voice & Accent", "On-Camera", "Stage Combat", "Martial Arts", "Stunts"],
  },
  {
    craft: "graphic_designer",
    names: ["Logo Smith", "Type Master", "Brand Builder", "Good Drawer", "Illustrator", "Layout", "Album Cover", "Motion"],
  },
  {
    craft: "makeup_artist",
    names: ["Flawless Beat", "Glam", "SFX", "Bridal", "Editorial", "Brow Architect"],
  },
  {
    craft: "tattoo_artist",
    names: ["Fine Line", "Color Packing", "Black & Grey", "Realism", "Script", "Cover-Up"],
  },
  {
    craft: "writer",
    names: ["The Pen", "Hook Smith", "Author", "Poet", "Screenwriter", "Ghostwriter"],
  },
  {
    craft: "fashion",
    names: ["Tailor", "Streetwear", "Pattern Maker", "Drip", "Custom", "Sustainable"],
  },
];

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function badgeSlug(craft: Craft, name: string): string {
  return `${craft}.${slugify(name)}`;
}

export interface FlatBadge {
  craft: Craft;
  name: string;
  slug: string;
  description: string;
  iconKey: string;
}

// Flattened catalog used to seed the `badges` table and drive the picker UI.
export const ALL_BADGES: FlatBadge[] = BADGE_CATALOG.flatMap((entry) =>
  entry.names.map((name) => ({
    craft: entry.craft,
    name,
    slug: badgeSlug(entry.craft, name),
    description: `${name} — a ${entry.craft.replace("_", " ")} badge. Climb Bronze → Diamond with Love + verified Proof.`,
    iconKey: slugify(name),
  })),
);

export function badgesForCraft(craft: Craft): FlatBadge[] {
  return ALL_BADGES.filter((b) => b.craft === craft);
}
