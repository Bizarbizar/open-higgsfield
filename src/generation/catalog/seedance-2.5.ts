import type { ModelEntry } from "./types";
import { SEEDANCE_ASPECT } from "./tokens";

const seedance25Settings = {
  resolution: { type: "enum", values: ["480p", "720p"], default: "720p" },
  generateAudio: { type: "boolean", default: true },
  outputFormat: { type: "enum", values: ["mp4", "mov"], default: "mp4" },
} as const satisfies ModelEntry["settings"];

export const seedance25: ModelEntry = {
  id: "seedance-2.5",
  surface: "video",
  label: "Seedance 2.5",
  roles: { start: 1, end: 1, reference: 30, video: 10, audio: 10 },
  settings: {
    aspectRatio: { type: "enum", values: SEEDANCE_ASPECT, default: "16:9" },
    duration: { type: "range", min: 4, max: 30, default: 5 },
    ...seedance25Settings,
  },
};

export const seedance25Edit: ModelEntry = {
  id: "seedance-2.5-edit",
  surface: "video",
  label: "Seedance 2.5 Edit",
  roles: { video: 1, reference: 30, audio: 10 },
  settings: seedance25Settings,
};

export const seedance25Extend: ModelEntry = {
  id: "seedance-2.5-extend",
  surface: "video",
  label: "Seedance 2.5 Extend",
  roles: { video: 1, reference: 30, audio: 10 },
  settings: {
    duration: { type: "range", min: 4, max: 30, default: 5 },
    ...seedance25Settings,
  },
};
