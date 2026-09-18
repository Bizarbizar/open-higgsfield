"use server";

import Anthropic from "@anthropic-ai/sdk";

import { getModel } from "@/generation/catalog";

import { BLOCKS, BLOCK_LABELS, profileFor, type Fields } from "./profiles";

const MODEL = "claude-opus-5";
const MAX_BRIEF = 4000;

/* PROMPTS.md §5, verbatim in intent. Frozen so the cached prefix survives
   across calls; everything per-request goes in the user turn. */
const META_PROMPT = `You are a prompt writer for the Higgsfield API. Given a creative brief and a target model, write ONE final prompt in English that the model will follow.

Rules:
1. Structure the prompt in this order, as flowing sentences (never keyword lists): SUBJECT (1–2 concrete attributes) → ACTION (video: one action arc; image: the pose/instant) → SETTING → LIGHTING → CAMERA (shot size, angle; video: exactly one primary camera move, in its own clause) → STYLE → SOUND (video with audio only) → CONSTRAINTS.
2. Length: image 40–120 words (Ideogram < 150); video 60–100 words per shot. Multi-shot prompts use "Shot 1:", "Shot 2:", "Closing:" labels — use time ranges only for Wan models, never for Seedance.
3. Write in the present tense. Show emotion through physical action. Phrase exclusions positively ("empty street", not "no people"); there is no negative_prompt field. Never add quality boosters ("8k", "masterpiece", "cinematic" alone). Avoid exact counts and complex physics.
4. Surface rules: for an IMAGE model, describe a single instant — no camera moves, no sequences, no sound. For an IMAGE-TO-VIDEO input (start frame provided), describe only what moves and the camera — do not restate the image. For MOTION TRANSFER / OBJECT SWAP models (genjutsu-*, kling-3-motion-*), do not describe motion: identify the subject or the element to replace and state what must stay unchanged. For EDIT/EXTEND models, describe only the change or the next beat.
5. Text to render on screen goes in double quotes, early, short, Latin letters only. References are cited as "the X from the first reference" (or @Image1/@Video1/@Audio1 for Seedance), each with an explicit role.
6. Audio: for Seedance/Kling 3/LTX/Wan/Grok Video, always state ambience, action-tied effects, and either the music or "no music" (Seedance: use the full suppressor stack "No music, no library audio, no voiceover narration, no on-screen text, no subtitles"). Dialogue: one sentence per quote, ≤10 words, with a speaker label.
7. Apply the model-specific notes you are given. If the brief asks for something the target model cannot do (e.g. a video sequence on an image model, on-screen text on LTX), keep the closest achievable intent and add one line after the prompt starting with "NOTE:" explaining the change.
8. The brief may be in any language; the prompt is always in English. Keep every concrete detail the brief gives (names, colours, materials, quoted text); invent nothing that contradicts it.

Output format: the prompt only, then an optional single "NOTE:" line. No headings, no explanations, no quotation marks around the prompt.`;

export type RefineInput = {
  modelId: string;
  brief?: string;
  fields?: Fields;
  draft?: string;
  hasStartFrame?: boolean;
};

export type RefineResult = { prompt: string; note: string | null };

export async function hasPromptAssistantAi(): Promise<boolean> {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function refinePrompt(input: RefineInput): Promise<RefineResult> {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("Prompt AI is not configured on this server");
  const model = getModel(String(input.modelId));
  const profile = profileFor(model);

  const brief = (input.brief ?? "").trim().slice(0, MAX_BRIEF);
  const draft = (input.draft ?? "").trim().slice(0, MAX_BRIEF);
  const filled = BLOCKS.filter((block) => (input.fields?.[block] ?? "").trim());
  if (!brief && !draft && filled.length === 0) throw new Error("Give the assistant a brief first");

  const lines = [
    `Target model: ${model.label} (id: ${model.id}, surface: ${model.surface}).`,
    `Word target: ${profile.words[0]}–${profile.words[1]}.`,
    `Model-specific notes:\n${profile.tips.map((tip) => `- ${tip}`).join("\n")}`,
    input.hasStartFrame ? "A start frame IS attached (image-to-video)." : "No start frame attached.",
  ];
  if (filled.length) {
    lines.push(
      `Structured fields the user filled:\n${filled
        .map((block) => `- ${BLOCK_LABELS[block]}: ${input.fields![block]!.trim().slice(0, 600)}`)
        .join("\n")}`,
    );
  }
  if (draft) lines.push(`Current draft prompt (improve it, keep its intent):\n${draft}`);
  if (brief) lines.push(`Brief:\n${brief}`);

  const client = new Anthropic();
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1200,
    system: [{ type: "text", text: META_PROMPT, cache_control: { type: "ephemeral" } }],
    output_config: { effort: "medium" },
    messages: [{ role: "user", content: lines.join("\n\n") }],
  });

  if (response.stop_reason === "refusal") throw new Error("The assistant declined this brief");

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
  if (!text) throw new Error("The assistant returned nothing");

  const noteIndex = text.search(/^NOTE:/m);
  if (noteIndex === -1) return { prompt: text, note: null };
  return {
    prompt: text.slice(0, noteIndex).trim(),
    note: text.slice(noteIndex).replace(/^NOTE:\s*/, "").trim() || null,
  };
}
