import type { ModelEntry } from "./types";

const QWEN_ASPECT = ["1:1", "4:3", "3:4", "16:9", "9:16", "3:2", "2:3", "21:9"] as const;

/** Text-to-image ignores images entirely; editing is its own endpoint that
    requires one to three of them. Two catalog entries so the tray tells the truth. */
export const qwenImage3: ModelEntry = {
  id: "qwen-image-3",
  surface: "image",
  label: "Qwen Image 3",
  roles: {},
  settings: {
    aspectRatio: { type: "enum", values: QWEN_ASPECT, default: "1:1" },
    resolution: { type: "enum", values: ["1k", "2k"], default: "1k" },
  },
  paths: { text: "alibaba/qwen-image-3/text-to-image" },
};

export const qwenImage3Edit: ModelEntry = {
  id: "qwen-image-3-edit",
  surface: "image",
  label: "Qwen Image 3 Edit",
  roles: { reference: 3 },
  settings: {
    aspectRatio: { type: "enum", values: QWEN_ASPECT, default: "1:1" },
    resolution: { type: "enum", values: ["1k", "2k"], default: "1k" },
  },
  paths: { reference: "alibaba/qwen-image-3/edit" },
};
