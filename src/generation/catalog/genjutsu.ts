import type { ModelEntry } from "./types";

/** Billed per second of the source video, not per generated second, so there
    is no duration setting. "higgsfiled" is the platform's own spelling. */
const genjutsuSettings = {
  resolution: { type: "enum", values: ["480p", "720p"], default: "720p" },
} as const satisfies ModelEntry["settings"];

export const genjutsuMotionTransfer: ModelEntry = {
  id: "genjutsu-motion-transfer",
  surface: "video",
  label: "Genjutsu Motion Transfer",
  roles: { video: 1, reference: 8 },
  settings: genjutsuSettings,
};

export const genjutsuObjectSwap: ModelEntry = {
  id: "genjutsu-object-swap",
  surface: "video",
  label: "Genjutsu Object Swap",
  roles: { video: 1, reference: 8 },
  settings: genjutsuSettings,
};
