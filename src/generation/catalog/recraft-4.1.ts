import type { ModelEntry } from "./types";

/** Text-to-image only (all four Recraft modes are), 1k only. */
export const recraft41: ModelEntry = {
  id: "recraft-4.1",
  surface: "image",
  label: "Recraft 4.1",
  roles: {},
  settings: {
    aspectRatio: {
      type: "enum",
      values: ["1:1", "4:3", "3:4", "16:9", "9:16", "3:2", "2:3", "5:4", "4:5", "2:1", "1:2"],
      default: "1:1",
    },
    resolution: { type: "enum", values: ["1k"], default: "1k" },
    outputFormat: { type: "enum", values: ["png", "jpg", "webp"], default: "png" },
  },
  paths: { text: "recraft/v4.1/text-to-image" },
};
