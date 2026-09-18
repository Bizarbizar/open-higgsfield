import type { ModelEntry } from "./types";

/** Direct mode only: without image_urls it generates, with them it edits.
    Preset enhancement (enhance_prompt + preset_id from a paginated CMS
    catalog) is deliberately left out — presets cannot be a static enum. */
export const marketingStudioImage: ModelEntry = {
  id: "marketing-studio-image",
  surface: "image",
  label: "Marketing Studio Image",
  roles: { reference: 16 },
  settings: {
    aspectRatio: {
      type: "enum",
      values: ["auto", "1:1", "3:2", "2:3", "4:3", "3:4", "16:9", "9:16", "21:9"],
      default: "auto",
    },
    resolution: { type: "enum", values: ["1k", "2k", "4k"], default: "2k" },
    quality: { type: "enum", values: ["low", "medium", "high"], default: "high" },
  },
};
