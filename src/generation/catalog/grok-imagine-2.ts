import type { ModelEntry } from "./types";

export const grokImagine2: ModelEntry = {
  id: "grok-imagine-2",
  surface: "image",
  label: "Grok Imagine 2.0",
  roles: { reference: 8 },
  settings: {
    aspectRatio: {
      type: "enum",
      values: ["auto", "1:1", "4:3", "3:4", "16:9", "9:16", "3:2", "2:3", "2:1", "1:2"],
      default: "auto",
    },
    resolution: { type: "enum", values: ["1k", "2k"], default: "1k" },
    quality: { type: "enum", values: ["low", "medium"], default: "medium" },
  },
  paths: { text: "xai/grok-imagine-image-2.0" },
};
