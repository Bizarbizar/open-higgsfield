import { BLOCKS, type Block, type Fields, type PromptProfile } from "./profiles";

const SEEDANCE_SILENCE =
  "No music, no library audio, no voiceover narration, no on-screen text, no subtitles.";

function sentence(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  const capped = trimmed[0]!.toUpperCase() + trimmed.slice(1);
  return /[.!?…"”]$/.test(capped) ? capped : `${capped}.`;
}

/** PROMPTS.md §2.2: `subject action setting. lighting. camera. style. sound.
    constraints.` — subject, action and setting fuse into one sentence, the
    rest stand alone; empty blocks vanish. */
export function assemblePrompt(fields: Fields, profile: PromptProfile): string {
  const get = (block: Block) =>
    profile.blocks[block] === "hidden" ? "" : (fields[block] ?? "").trim().replace(/\s+/g, " ");

  const opening = [get("subject"), get("action"), get("setting")]
    .filter(Boolean)
    .map((part, index) => (index === 0 ? part : part.replace(/^[.,;]\s*/, "")))
    .join(" ");

  const parts: string[] = [];
  if (opening) parts.push(sentence(opening));

  for (const block of BLOCKS) {
    if (block === "subject" || block === "action" || block === "setting") continue;
    let value = get(block);
    if (!value) continue;
    if (block === "sound" && profile.audioStack && /\bno music\b/i.test(value)) {
      value = value.replace(/,?\s*\bno music\b\.?/i, "").trim().replace(/[,;]$/, "");
      parts.push(...(value ? [sentence(value)] : []), SEEDANCE_SILENCE);
      continue;
    }
    parts.push(sentence(value));
  }

  return parts.join(" ");
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function missingRequired(fields: Fields, profile: PromptProfile): Block[] {
  return BLOCKS.filter(
    (block) => profile.blocks[block] === "required" && !(fields[block] ?? "").trim(),
  );
}
