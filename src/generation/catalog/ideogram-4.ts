import type { ModelEntry } from "./types";

/** Ideogram takes one optional input image (image_url + image_weight) and no
    resolution parameter; the mapper lives in to-platform.ts. */
export const ideogram4: ModelEntry = {
  id: "ideogram-4",
  surface: "image",
  label: "Ideogram 4.0",
  roles: { reference: 1 },
  settings: {
    aspectRatio: {
      type: "enum",
      values: ["1:1", "4:3", "3:4", "16:9", "9:16", "3:2", "2:3", "5:4", "4:5", "2:1", "1:2"],
      default: "1:1",
    },
    renderingSpeed: { type: "enum", values: ["TURBO", "DEFAULT", "QUALITY"], default: "DEFAULT" },
    imageWeight: { type: "range", min: 1, max: 100, default: 50 },
  },
};
