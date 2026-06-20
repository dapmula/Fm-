import type { Craft } from "./types";

export interface CraftMeta {
  craft: Craft;
  label: string;
  // Crest art status — the four with finished crests ship first (spec §8).
  crestReady: boolean;
  crestIcon: string; // emoji stand-in until SVG crest art lands
  // Suggested comparison artists for the "Compares to ___" step (spec §4.5).
  comps: string[];
}

export const CRAFTS: CraftMeta[] = [
  {
    craft: "rapper",
    label: "Rapper",
    crestReady: true,
    crestIcon: "🎤",
    comps: ["Lil Uzi Vert", "Kendrick Lamar", "Future", "J. Cole", "Drake", "Travis Scott"],
  },
  {
    craft: "singer",
    label: "Singer",
    crestReady: true,
    crestIcon: "🎤",
    comps: ["SZA", "The Weeknd", "Brent Faiyaz", "H.E.R.", "Frank Ocean", "Summer Walker"],
  },
  {
    craft: "producer",
    label: "Producer",
    crestReady: false,
    crestIcon: "🎛️",
    comps: ["Metro Boomin", "Kenny Beats", "Pharrell", "Timbaland", "Hit-Boy", "London on da Track"],
  },
  {
    craft: "photographer",
    label: "Photographer",
    crestReady: true,
    crestIcon: "📷",
    comps: ["Gunner Stahl", "Cam Kirk", "Annie Leibovitz", "Tyler Mitchell", "Petra Collins"],
  },
  {
    craft: "videographer",
    label: "Videographer",
    crestReady: true,
    crestIcon: "🎥",
    comps: ["Cole Bennett", "Hype Williams", "Dave Meyers", "Director X", "Spike Jonze"],
  },
  {
    craft: "model",
    label: "Model",
    crestReady: true,
    crestIcon: "💫",
    comps: ["Gigi Hadid", "Naomi Campbell", "Tyson Beckford", "Slick Woods", "Adut Akech"],
  },
  {
    craft: "barber",
    label: "Barber",
    crestReady: false,
    crestIcon: "💈",
    comps: ["Vic Blends", "Nez", "360Jeezy", "WigOut", "Adrian Mota"],
  },
  {
    craft: "dj",
    label: "DJ",
    crestReady: false,
    crestIcon: "🎧",
    comps: ["DJ Khaled", "Kaytranada", "DJ Drama", "A-Trak", "DJ Mustard"],
  },
  {
    craft: "dancer",
    label: "Dancer",
    crestReady: false,
    crestIcon: "🕺",
    comps: ["Les Twins", "Sherrie Silver", "Ayo & Teo", "Aliya Janell", "Parris Goebel"],
  },
  {
    craft: "actor",
    label: "Actor",
    crestReady: false,
    crestIcon: "🎬",
    comps: ["Michael B. Jordan", "Zendaya", "Donald Glover", "Viola Davis", "Timothée Chalamet"],
  },
  {
    craft: "graphic_designer",
    label: "Graphic Designer",
    crestReady: false,
    crestIcon: "🎨",
    comps: ["Virgil Abloh", "Ibn Inglor", "David Rudnick", "Hassan Rahim", "Brian Roettinger"],
  },
  {
    craft: "makeup_artist",
    label: "Makeup Artist",
    crestReady: false,
    crestIcon: "💄",
    comps: ["Pat McGrath", "Sir John", "Mario Dedivanovic", "Danessa Myricks", "Alexx Mayo"],
  },
  {
    craft: "tattoo_artist",
    label: "Tattoo Artist",
    crestReady: false,
    crestIcon: "🖋️",
    comps: ["Dr. Woo", "Kat Von D", "Nikko Hurtado", "Scott Campbell", "Bang Bang"],
  },
  {
    craft: "writer",
    label: "Writer",
    crestReady: false,
    crestIcon: "✍️",
    comps: ["Ta-Nehisi Coates", "Issa Rae", "Donald Glover", "Phoebe Waller-Bridge"],
  },
  {
    craft: "fashion",
    label: "Fashion / Clothing",
    crestReady: false,
    crestIcon: "🧵",
    comps: ["Virgil Abloh", "Telfar", "Kerby Jean-Raymond", "Martine Rose", "Heron Preston"],
  },
];

export const CRAFT_BY_KEY: Record<Craft, CraftMeta> = CRAFTS.reduce(
  (acc, c) => {
    acc[c.craft] = c;
    return acc;
  },
  {} as Record<Craft, CraftMeta>,
);

export function craftLabel(craft: Craft): string {
  return CRAFT_BY_KEY[craft]?.label ?? craft;
}
