import type { ModelEntry } from "./types";

/** Kling 2.5 Turbo takes no aspect ratio or resolution; duration is 5 or 10 only. */
const kling25Settings = {
  duration: { type: "range", min: 5, max: 10, default: 5, step: 5 },
  cfgScale: { type: "range", min: 0, max: 1, default: 0.5, step: 0.01 },
} as const satisfies ModelEntry["settings"];

export const kling25: ModelEntry = {
  id: "kling-2.5",
  surface: "video",
  label: "Kling 2.5 Turbo Standard",
  roles: { start: 1 },
  settings: kling25Settings,
};

export const kling25Pro: ModelEntry = {
  id: "kling-2.5-pro",
  surface: "video",
  label: "Kling 2.5 Turbo Pro",
  roles: { start: 1 },
  settings: kling25Settings,
};
