import type { ModelEntry } from "./types";

/** Text only, prompt capped at 800 characters by the API. */
export const zImageTurbo: ModelEntry = {
  id: "z-image-turbo",
  surface: "image",
  label: "Z-Image Turbo",
  roles: {},
  settings: {
    aspectRatio: { type: "enum", values: ["1:1", "4:3", "3:4", "16:9", "9:16", "3:2", "2:3"], default: "1:1" },
    resolution: { type: "enum", values: ["1k", "2k"], default: "1k" },
  },
  paths: { text: "z-image/turbo" },
};
