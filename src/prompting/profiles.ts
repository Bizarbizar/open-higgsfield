import type { ModelEntry } from "@/generation/catalog";

/** The eight blocks of PROMPTS.md §1.1, in assembly order. */
export const BLOCKS = [
  "subject",
  "action",
  "setting",
  "lighting",
  "camera",
  "style",
  "sound",
  "constraints",
] as const;

export type Block = (typeof BLOCKS)[number];
export type BlockState = "required" | "optional" | "hidden";
export type Fields = Partial<Record<Block, string>>;

export const BLOCK_LABELS: Record<Block, string> = {
  subject: "Subject",
  action: "Action",
  setting: "Setting",
  lighting: "Lighting",
  camera: "Camera",
  style: "Style",
  sound: "Sound",
  constraints: "Constraints",
};

export const BLOCK_HINTS: Record<Block, string> = {
  subject: "Who or what — 1–2 concrete attributes (age, outfit, material, colour)",
  action: "What happens — one action arc for video, the pose or instant for image",
  setting: "Place, time of day, weather, foreground / background",
  lighting: "Source, direction, temperature, visible atmosphere (haze, rim light…)",
  camera: "Shot size, angle, lens — video: one primary camera move",
  style: "Medium, grade, palette, era reference — no “8k / masterpiece”",
  sound: "Ambience, action-tied effects, music or “no music”, dialogue in quotes",
  constraints: "What must stay unchanged; on-screen text in quotes; exclusions phrased positively",
};

export type PromptProfile = {
  blocks: Record<Block, BlockState>;
  /** Target length of the assembled prompt, in words. */
  words: [number, number];
  /** Short model-specific rules shown beside the form (English, imperative). */
  tips: string[];
  example: string;
  /** Shown when a start frame is attached: image-to-video changes what to write. */
  startFrameNote?: string;
  /** Seedance needs the full suppressor stack; a bare "no music" leaks pads. */
  audioStack?: boolean;
  /** Per-block placeholder overrides where the generic hint would mislead. */
  hints?: Partial<Record<Block, string>>;
};

function states(overrides: Partial<Record<Block, BlockState>>, base: BlockState): Record<Block, BlockState> {
  const out = {} as Record<Block, BlockState>;
  for (const block of BLOCKS) out[block] = overrides[block] ?? base;
  return out;
}

const IMAGE_BASE = states(
  { subject: "required", action: "required", setting: "required", lighting: "required", sound: "hidden" },
  "optional",
);

const VIDEO_BASE = states(
  { subject: "required", action: "required", setting: "required", camera: "required" },
  "optional",
);

const IMAGE_TIPS = [
  "Describe a single instant — no camera moves, no sequence, no sound.",
  "Full sentences, not keyword lists.",
  "Phrase exclusions positively (“empty street”, not “no people”).",
];

const VIDEO_TIPS = [
  "One action arc and exactly one primary camera move per shot.",
  "Present tense, flowing sentences; show emotion through physical action.",
  "Keep motion simple enough for the clip length.",
];

const GENERIC_IMAGE: PromptProfile = {
  blocks: IMAGE_BASE,
  words: [40, 120],
  tips: IMAGE_TIPS,
  example:
    "A ceramic mug on a worn oak table, steam curling up, morning window light from the left, shallow depth of field, muted warm palette, medium close-up slightly above eye level.",
};

const GENERIC_VIDEO: PromptProfile = {
  blocks: VIDEO_BASE,
  words: [60, 100],
  tips: VIDEO_TIPS,
  example:
    "A woman in a charcoal wool coat walks past rain-wet storefronts, stops, and exhales visibly in the cold air. Night street after rain, neon reflections on the asphalt. Slow push-in from a 45° angle, ending in a medium close-up. 35mm look, muted teal-and-amber grade. Light rain, distant traffic, no music.",
  startFrameNote:
    "A start frame is attached: describe only what moves and the camera — do not restate the image.",
};

const SOUL: PromptProfile = {
  ...GENERIC_IMAGE,
  words: [30, 80],
  tips: [
    "Say the kind of photo in one clause: “shot on a phone with flash”, “editorial 35mm”.",
    "Subject, pose and lifestyle context carry the image; “cinematic / masterpiece” add nothing.",
    "Leave Enhance prompt on for a short intent, off for a precise, repeatable prompt.",
  ],
  example:
    "Woman in her late 20s, freckles, oversized cream knit, sitting on a kitchen counter holding a mug, morning light from a side window, soft shadows, candid phone-camera look with slight flash, muted warm palette, medium shot slightly above eye level.",
};

const MARKETING: PromptProfile = {
  blocks: states(
    { subject: "required", setting: "required", lighting: "required", constraints: "required", sound: "hidden" },
    "optional",
  ),
  words: [50, 100],
  tips: [
    "Name what each reference brings: “the bottle from the first reference”, “the logo from the second, unchanged”.",
    "Product (material, shape) → staging (surface, props) → studio light → angle → brand palette → constraints.",
    "Inputs above ~4000 px or tens of MB fail silently — downscale first.",
  ],
  example:
    "Campaign image for a premium skincare brand: the glass serum bottle from the first reference standing on a sculptural sandstone block, a shallow pool of water in front reflecting it, soft directional daylight from the upper left, pale sand and warm ivory palette, three-quarter view slightly below eye level, 50mm look. Place the logo from the second reference small in the lower right corner, exactly as provided. No additional text, no people.",
  hints: {
    subject: "The product — material, shape, and which reference it comes from",
    action: "Staging: surface, props, how the product sits",
    constraints: "Logo placement and “exactly as provided”; “no additional text, no people”",
  },
};

const IDEOGRAM: PromptProfile = {
  blocks: states(
    { constraints: "required", subject: "required", style: "required", sound: "hidden" },
    "optional",
  ),
  words: [40, 150],
  tips: [
    "Put the on-screen text in double quotes, early, short, Latin letters without accents.",
    "Describe the typeface concretely: “bold condensed sans-serif”, “formal script with flourishes”.",
    "Keep the background simple behind the lettering; under 150 words.",
  ],
  example:
    "A vintage travel poster with the words \"RIDE FREE\" in bold condensed sans-serif across the top and \"Coastal Route 1\" in a small script line at the bottom. A woman on a bicycle on a countryside road, rolling hills, late-afternoon sun, flat retro color blocks in teal, mustard and cream, centered composition with generous margins.",
  hints: {
    constraints: "The text to render, in double quotes, with typeface and placement",
    style: "Poster / label / cover style, palette, era",
  },
};

const RECRAFT: PromptProfile = {
  blocks: states(
    { subject: "required", style: "required", constraints: "required", lighting: "hidden", sound: "hidden" },
    "optional",
  ),
  words: [40, 120],
  tips: [
    "Describe the graphic system: shape logic, strict palette, stroke discipline, layout.",
    "For vector work end with “flat colors only, no gradients, no shadows, no texture”.",
    "Ask for a system (“logo with matching icon set”) rather than one isolated asset.",
  ],
  example:
    "Minimal playful logo for a coffee roaster: a single-line cup with a rising steam curl forming the letter R, flat colors only, deep muted green background with warm off-white marks, thick uniform strokes, rounded corners, centered on a square canvas, no gradients, no shadows, no texture.",
  hints: {
    style: "Graphic type (flat vector, line icon, editorial illustration), palette, stroke",
    constraints: "“no gradients, no shadows, no texture”; canvas and layout rules",
  },
};

const QWEN: PromptProfile = {
  ...GENERIC_IMAGE,
  words: [80, 150],
  tips: [
    "Long, descriptive prompts with several elements work well here.",
    "State spatial relations explicitly: “to the left of”, “in the foreground”.",
  ],
};

const ZIMAGE: PromptProfile = {
  ...GENERIC_IMAGE,
  blocks: states({ subject: "required", setting: "required", lighting: "required", sound: "hidden" }, "optional"),
  words: [20, 50],
  tips: ["Fast model: one subject, one setting, one light. Do not over-specify."],
};

const GROK_IMAGE: PromptProfile = {
  ...GENERIC_IMAGE,
  words: [40, 80],
  tips: ["Subject first, then style/medium, environment, lighting, mood.", "Responds to a bold, contemporary, saturated look."],
};

const SEEDANCE: PromptProfile = {
  blocks: states({ subject: "required", action: "required", setting: "required", camera: "required", sound: "required" }, "optional"),
  words: [60, 100],
  tips: [
    "Cite references with a role: “the hiker from @Image1”, “@Video1 for camera movement only”.",
    "Multi-shot: label “Shot 1:”, “Shot 2:”, “Closing:” — never second ranges.",
    "Dialogue: one sentence per quote, ≤10 words, add “realistic lip articulation, no exaggerated mouth opening”.",
    "To silence music the full stack is needed (added for you when Sound says “no music”).",
  ],
  example:
    "Shot 1: The barista from @Image1 slides a cup across a sunlit wooden bar, medium close-up, locked camera, facing camera. She says \"One flat white, extra warm.\" Espresso machine hissing behind her. Closing: she rests both hands on the counter in a held medium close-up. Dialogue clean and prominent, ambient cafe murmur subtle. No music, no library audio, no voiceover narration, no on-screen text, no subtitles.",
  startFrameNote: "A start frame is attached: describe what moves and the camera, not the frame itself.",
  audioStack: true,
};

const SEEDANCE_EDIT: PromptProfile = {
  blocks: states({ action: "required", constraints: "required", subject: "optional", sound: "optional" }, "hidden"),
  words: [20, 50],
  tips: [
    "Describe the change, not the scene: “Replace [element] with [element from @Image1].”",
    "Then lock everything else: “Keep framing, timing, lighting and other people unchanged.”",
  ],
  example:
    "Replace the red jacket on the cyclist with the yellow rain shell from @Image1. Keep framing, timing, lighting and the other riders unchanged.",
  hints: { action: "The change to make", constraints: "What must stay unchanged" },
};

const SEEDANCE_EXTEND: PromptProfile = {
  blocks: states({ action: "required", sound: "optional", camera: "optional" }, "hidden"),
  words: [30, 60],
  tips: ["Start with “Continue the shot:” and give one next beat in the same light and camera.", "No change of place or lighting."],
  example:
    "Continue the shot: she sets the cup down, turns toward the window and lifts the blind halfway; the light widens across the counter. Same camera height, gentle drift right. Room tone, no music.",
  hints: { action: "The next beat, in continuity" },
};

const KLING3: PromptProfile = {
  ...GENERIC_VIDEO,
  tips: [
    "Subject + movement + scene, then camera, lighting, atmosphere. Movement simple enough for 5 s.",
    "With start and end frames, describe the transition between them, not the two images.",
    "Multi-shot: “Shot 1:” / “Shot 2:”, constant character labels, no pronouns; dialogue as [Name, voice]: \"line\".",
    "No exact counts, no complex physics.",
  ],
  example:
    "A chef in a white jacket lifts a copper pan off the flame, tilts it, and a wave of caramel folds over. Steel kitchen, single overhead tungsten lamp, steam catching the light. Camera pushes in slowly from a medium shot to a close-up on the pan. Sizzle and a soft gas hiss, no music.",
};

const KLING_TURBO: PromptProfile = {
  ...KLING3,
  blocks: states({ subject: "required", action: "required", setting: "required", sound: "hidden" }, "optional"),
  tips: ["Same rules as Kling 3.0 without sound or multi-shot — iterate short.", "No exact counts, no complex physics."],
};

const KLING25: PromptProfile = {
  ...KLING_TURBO,
  words: [30, 80],
  tips: ["Duration is 5 or 10 s: write one action that fits.", "No negative prompt in the app — phrase exclusions positively."],
  startFrameNote: "Start frame attached: write motion + camera only (30–60 words), do not describe the image.",
};

const TRANSFER: PromptProfile = {
  blocks: states({ subject: "required", constraints: "optional" }, "hidden"),
  words: [10, 30],
  tips: [
    "The source video supplies motion, timing and camera — do not describe the choreography.",
    "Name the subject with 1–2 attributes and tie it to the reference (“the woman in the first image”).",
  ],
  example: "Apply the motion of the source video to the woman in the red jumpsuit from the first image. Keep the camera and timing.",
  hints: { subject: "Who performs the motion — tied to the reference image", constraints: "“Keep the camera and timing.”" },
};

const OBJECT_SWAP: PromptProfile = {
  blocks: states({ action: "required", constraints: "required" }, "hidden"),
  words: [15, 40],
  tips: [
    "Formula: “Replace [object in the source video] with [object in the reference image].”",
    "One target at a time; say size and position if they must match.",
  ],
  example:
    "Replace the golf ball in the source video with the dinosaur egg from the first reference image, same size and position. Keep the golfer, the swing, the lighting and the camera exactly the same.",
  hints: { action: "Replace X with Y (from which reference)", constraints: "“Keep the rest of the shot the same.”" },
};

const KLING_MOTION: PromptProfile = {
  blocks: states({ subject: "required", setting: "optional", lighting: "optional" }, "hidden"),
  words: [10, 40],
  tips: [
    "The video supplies the motion; the prompt identifies the character in the image.",
    "Start from “The character in the image performs the motion of the video.”",
  ],
  example: "The character in the image performs the motion of the video, on a rooftop at dusk, warm backlight.",
  hints: { subject: "“The character in the image performs the motion of the video” + who they are" },
};

const MINIMAX: PromptProfile = {
  ...GENERIC_VIDEO,
  tips: [
    "Long flowing sentences with temporal connectors: “then”, “as”, “while”.",
    "Write the emotional beat as visible actions (“her eyes widen, then she looks away”).",
    "Camera in plain language; bracket syntax like [Push in] is tolerated.",
  ],
  example:
    "A retired boxer in a grey hoodie sits on the edge of a locker-room bench; he unwraps the tape from his hands slowly, then looks up as the door opens and light floods in across his face. Slow push-in from a wide shot to a medium close-up, warm tungsten key from the doorway, cool fluorescent fill.",
};

const MINIMAX_H3: PromptProfile = {
  ...MINIMAX,
  tips: [...MINIMAX.tips, "2K, wide ratios: think cinemascope — off-centre subject, described depth of field."],
};

const WAN: PromptProfile = {
  ...GENERIC_VIDEO,
  tips: [
    "Entity + scene + motion, then aesthetic control. One camera move chosen for its effect.",
    "Multi-shot uses time ranges here: “Shot 1 [0–3 s] …, Shot 2 [4–6 s] …”.",
    "Say “no background music” explicitly, otherwise Wan adds some.",
  ],
  startFrameNote: "Start frame attached: motion + camera movement only, do not describe the image.",
  example:
    "The subject turns her head slowly to the left and smiles, strands of hair lifting in a light breeze; steam rises from the cup in her hands. Camera pushes in gently, fixed height. Soft ambient room tone, no background music.",
};

const LTX: PromptProfile = {
  ...GENERIC_VIDEO,
  blocks: states({ subject: "required", action: "required", setting: "required", camera: "required", sound: "required" }, "optional"),
  tips: [
    "Shot, scene, action, character, camera, audio — one paragraph in the present tense.",
    "Spoken line in quotes; detail follows shot size (close-up = named materials).",
    "Avoid on-screen text, chaotic motion, two competing action arcs, mixed light sources.",
  ],
  example:
    "A cinematic aerial shot at dawn over a wide misty valley, a cluster of colorful hot-air balloons rising slowly through the golden morning haze. The camera cranes gently upward and drifts back to reveal dozens of balloons above a patchwork of fields. Warm golden light, a rich cinematic grade. The audio is the occasional deep whoosh of a balloon burner, a gentle high-altitude breeze, and distant birdsong, no music.",
};

const PIXVERSE: PromptProfile = {
  ...GENERIC_VIDEO,
  words: [40, 80],
  tips: ["Name the style first (anime, cel-shaded, claymation) — PixVerse follows named styles well.", "One camera move, under 80 words."],
};

const GROK_VIDEO: PromptProfile = {
  ...GENERIC_VIDEO,
  blocks: states(
    { subject: "required", action: "required", setting: "required", camera: "required", sound: "required", constraints: "required" },
    "optional",
  ),
  tips: [
    "References carry people, objects and clothing without locking the first frame: describe scene, action and camera.",
    "Say what must stay consistent with the references; put the key action early.",
    "Always add a Sound block — without it audio is random or silent.",
  ],
  example:
    "The woman from the reference images, same face, hair and green hooded cloak, walks through a misty medieval market at dawn while traders set up wooden stalls behind her; she glances at the camera, then ahead. Camera tracks alongside at shoulder height. Sound: low market murmur, footsteps on wet stone, a single bird call, no music.",
  hints: { constraints: "What stays consistent with the references" },
};

const FIRST_LAST: PromptProfile = {
  blocks: states({ action: "required", camera: "optional" }, "hidden"),
  words: [30, 60],
  tips: ["Describe the transition between the two frames and the camera move that carries it — not the frames themselves."],
  example:
    "The paper crane on the desk unfolds itself flat, then the sheet lifts and drifts out of the open window. Camera holds still, slight rack focus to the window at the end.",
  hints: { action: "How the first frame becomes the last" },
};

const BY_ID: Record<string, PromptProfile> = {
  "soul-2": SOUL,
  "soul-standard": SOUL,
  "soul-cinema": SOUL,
  "marketing-studio-image": MARKETING,
  "ideogram-4": IDEOGRAM,
  "recraft-4.1": RECRAFT,
  "qwen-image-3": QWEN,
  "z-image-turbo": ZIMAGE,
  "grok-imagine-2": GROK_IMAGE,
  "seedance-2.5": SEEDANCE,
  "seedance-2": SEEDANCE,
  "seedance-2-fast": SEEDANCE,
  "seedance-2-mini": SEEDANCE,
  "seedance-2.5-edit": SEEDANCE_EDIT,
  "seedance-2.5-extend": SEEDANCE_EXTEND,
  "kling-3-std": KLING3,
  "kling-3-pro": KLING3,
  "kling-3-4k": KLING3,
  "kling-3-turbo": KLING_TURBO,
  "kling-2.6": KLING_TURBO,
  "kling-2.5": KLING25,
  "kling-2.5-pro": KLING25,
  "kling-3-motion-std": KLING_MOTION,
  "kling-3-motion-pro": KLING_MOTION,
  "genjutsu-motion-transfer": TRANSFER,
  "genjutsu-object-swap": OBJECT_SWAP,
  "kling-o1": FIRST_LAST,
  "kling-o3": FIRST_LAST,
  "minimax-h3": MINIMAX_H3,
  "minimax-hailuo-2.3": MINIMAX,
  "wan-3": WAN,
  "wan-3-prime": WAN,
  "wan-2.7": WAN,
  "wan-2.6": WAN,
  "ltx-2.5-fast": LTX,
  "ltx-2.5-pro": LTX,
  "pixverse-6": PIXVERSE,
  "grok-imagine-video-1.5": GROK_VIDEO,
};

export function profileFor(model: ModelEntry): PromptProfile {
  return BY_ID[model.id] ?? (model.surface === "image" ? GENERIC_IMAGE : GENERIC_VIDEO);
}

export function visibleBlocks(profile: PromptProfile): Block[] {
  return BLOCKS.filter((block) => profile.blocks[block] !== "hidden");
}
