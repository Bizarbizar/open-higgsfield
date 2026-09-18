import type { ModelEntry } from "./types";

/** Strict by default: an unknown value is a bad request. `lenient` is for the
    UI reading persisted settings after a catalog change — a value the model no
    longer accepts falls back to its default instead of breaking the composer. */
export function parseSettings(
  model: ModelEntry,
  raw: Record<string, unknown>,
  options: { lenient?: boolean } = {},
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(model.settings)) {
    const value = raw[key];
    if (field.type === "enum") {
      let picked = typeof value === "string" ? value : field.default;
      if (!field.values.includes(picked)) {
        if (!options.lenient) throw new Error(`Invalid ${key}`);
        picked = field.default;
      }
      out[key] = picked;
      continue;
    }
    if (field.type === "range") {
      let picked = typeof value === "number" ? value : field.default;
      if (picked < field.min || picked > field.max) {
        if (!options.lenient) throw new Error(`Invalid ${key}`);
        picked = field.default;
      }
      out[key] = picked;
      continue;
    }
    out[key] = typeof value === "boolean" ? value : field.default;
  }
  return out;
}
