import { t2v } from "./defaults";
import type { ModelEntry } from "./types";

/** H3 only renders 2K and takes 5–15 s clips; the shared video defaults
    (720p/1080p, 4–10 s) are rejected with a 400. */
export const minimaxH3: ModelEntry = {
  id: "minimax-h3",
  surface: "video",
  label: "MiniMax H3",
  roles: { start: 1 },
  settings: {
    aspectRatio: {
      type: "enum",
      values: ["auto", "adaptive", "21:9", "16:9", "4:3", "1:1", "3:4", "9:16"],
      default: "auto",
    },
    resolution: { type: "enum", values: ["2K"], default: "2K" },
    duration: { type: "range", min: 5, max: 15, default: 5 },
  },
  paths: t2v("minimax/h3/text-to-video"),
};
