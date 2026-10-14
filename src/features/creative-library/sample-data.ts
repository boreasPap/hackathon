// Sample content of the parts that have no backend yet: AI Insights, the
// Script Generator and the Music Generator directions. Written by hand for
// Hair App's four reference categories; no model produces them.

export type CategoryId = "hairstyle" | "haircolor" | "faceshape" | "golden-ratio";
export type Category = { id: CategoryId; name: string };
export type ScriptKind = "wall-texts" | "voiceover-scripts";

export type TextIteration = { angle: string; text: string; source: string; note: string };
export type SlotIteration = { label: string };

export const APP_NAME = "Hair App";

export const CATEGORIES: Category[] = [
  { id: "hairstyle", name: "Hair Style" },
  { id: "haircolor", name: "Hair Color" },
  { id: "golden-ratio", name: "Golden Ratio" },
  { id: "faceshape", name: "Face Shape" },
];

export const getCategory = (id: string) => CATEGORIES.find((c) => c.id === id.toLowerCase());

/** The sample category a creative tag stands for ("Hair Color", "haircolor" → haircolor). */
export function sampleCategoryOf(tag: string | undefined): CategoryId | undefined {
  const key = tag?.toLowerCase().replace(/[^a-z]/g, "");
  return CATEGORIES.find((c) => c.id.replace(/-/g, "") === key)?.id;
}

/** Favorites of sample content use this in place of a creative id. */
export const sampleAnchor = (category: CategoryId) => `sample:${category}`;
export const isSampleAnchor = (id: string) => id.startsWith("sample:");
export const anchorCategory = (id: string) => getCategory(id.slice("sample:".length))?.id;

const OBSERVATIONS: Record<CategoryId, string[]> = {
  faceshape: [
    "Face-outline overlays make the face-shape theme visible.",
    "Both selfie-led and salon-led presentations appear in this set.",
    "Haircut comparisons appear alongside presenter portraits.",
  ],
  haircolor: [
    "Multiple references use a question about which color to choose.",
    "Color swatches and alternative portrait thumbnails are recurring visual devices.",
    "Both transformation-led and presenter-led formats are included.",
  ],
  hairstyle: [
    "Haircut alternatives are shown through portraits, cards and comparisons.",
    "Questions about which hairstyle suits the person appear in several opening frames.",
    "This reference set includes both male and female presenters.",
  ],
  "golden-ratio": [
    "Several opening frames introduce facial proportions through talking presenters.",
    "Some references use picture-in-picture portrait comparisons.",
    "Face-shape messaging appears alongside the proportions theme.",
  ],
};

export const getObservations = (category: CategoryId) => OBSERVATIONS[category];

const SUBJECTS: Record<CategoryId, [item: string, basis: string]> = {
  faceshape: ["haircut", "face shape"],
  haircolor: ["hair color", "different shades"],
  hairstyle: ["hairstyle", "different cuts"],
  "golden-ratio": ["hairstyle", "facial proportions"],
};

export const ANGLES = ["Curiosity", "Educational", "Problem → solution", "Benefit-focused", "Winner Mix", "Social proof"];

const MUSIC_DIRECTIONS = ["Fresh rhythm", "Different instrumentation", "Mood variation", "Energy variation", "New melody", "Trending sound"];

export function getTextIterations(category: CategoryId, type: ScriptKind): TextIteration[] {
  const [item, basis] = SUBJECTS[category];
  const walls = [
    `Same face. Different ${item}. Which one feels like you?`,
    `What changes when you compare ${basis}?`,
    `Unsure about your next ${item}? Preview it first.`,
    `Explore your next ${item} with one photo.`,
    `${category === "haircolor" ? "Choose a shade" : "Find a new look"} — then see it on your own face.`,
    `Everyone is previewing their next ${item} first. Your turn.`,
  ];
  const scripts = [
    `Ever wondered why a ${item} looks different on every person? Upload your photo to HairApp and explore ${basis} before choosing your next look.`,
    `Choosing a ${item} starts with seeing the options on you. Use your photo in HairApp to compare ${basis} and notice how each option changes your look.`,
    `Can’t decide on your next ${item}? Start with a preview. Upload a photo to HairApp, compare the options, and save the looks you want to explore.`,
    `One photo can help you explore a whole new look. Try ${basis} with HairApp and compare your favorites before your next salon visit.`,
    `Which ${item} feels most like you? Start with a question, then compare the options on your own photo. HairApp lets you explore ${basis} and find a look you want to try.`,
    `People now preview their next ${item} before the salon. Upload a photo to HairApp, compare ${basis}, and keep the look you love.`,
  ];
  const name = getCategory(category)?.name ?? "";
  return (type === "wall-texts" ? walls : scripts).map((text, i) => ({
    angle: ANGLES[i],
    text,
    source: name,
    note:
      i === 4
        ? "Category reference mix: question-led opening + comparison-led structure. Experimental draft."
        : `Draft inspired by the ${name} reference set. Not a predicted winner.`,
  }));
}

export function getMusicDirections(): SlotIteration[] {
  return MUSIC_DIRECTIONS.map((label) => ({ label }));
}

// Script generator examples: twelve themes per category for wall texts and
// voiceover scripts, three versions each (refresh moves to the next one).
// Favorites store them as iterations above EXAMPLE_ITERATION_BASE.
export const EXAMPLE_ITERATION_BASE = 100;
export const EXAMPLE_THEMES = 12;
export const EXAMPLE_VERSIONS = 3;

export type ScriptExample = { theme: string; text: string };

const VOICE_CTAS = [
  "Upload one photo to HairApp and see it on you.",
  "Try it in HairApp before your next salon visit.",
];

function exampleThemes(category: CategoryId): [theme: string, walls: string[], voice: string][] {
  const [item, basis] = SUBJECTS[category];
  return [
    ["Curiosity", [`Same face. Different ${item}. Which one feels like you?`, `Same you. New ${item}. Which one wins?`, `One face, ten ${item} looks. Pick one.`], `Ever wondered why a ${item} looks so different on every person? Upload one photo to HairApp and see ${basis} on your own face before you decide.`],
    ["Question hook", [`Which ${item} would you pick for me?`, `Be honest: which ${item} suits me?`, `Help me choose my next ${item}.`], `Okay, help me choose. I put my photo into HairApp and tried every ${item}. Comment the one you would pick for me.`],
    ["Before / after", [`Before: unsure. After: my next ${item}, seen in seconds.`, `From "no idea" to my perfect ${item} in one photo.`, `My ${item} before vs. the one AI picked.`], `Before, I had no idea what to ask my stylist for. After two minutes in HairApp, I knew exactly which ${item} suits me.`],
    ["Myth-busting", [`Stop guessing your ${item}. Your face already knows.`, `The right ${item} isn't luck. It's ${basis}.`, `You don't need a risky cut to try a new ${item}.`], `You don't need luck to find the right ${item}. HairApp compares ${basis} on your own photo, so you can stop guessing.`],
    ["Problem → solution", [`Unsure about your next ${item}? Preview it first.`, `Afraid of a bad ${item}? Try it on first.`, `Never regret a ${item} again. Preview it.`], `Scared of a bad ${item}? Preview it first. Upload a photo, compare the options and only book once you love what you see.`],
    ["Benefit-focused", [`Explore your next ${item} with one photo.`, `See every ${item} on you before the salon.`, `Your next ${item}, found in seconds.`], `One photo is all it takes. HairApp shows you ${basis} side by side, so choosing your next ${item} feels easy.`],
    ["Social proof", [`Everyone is previewing their next ${item} first. Your turn.`, `Millions try their ${item} here first.`, `Why everyone previews their ${item} now.`], `Millions of people preview their next ${item} before the salon now. Try HairApp and see why everyone is doing it.`],
    ["Trend", [`Trying every ${item} in 10 seconds.`, `The ${item} filter everyone is trying.`, `I let the trend pick my ${item}.`], `I tried every ${item} in ten seconds without touching my hair. This is the HairApp trend everyone is doing right now.`],
    ["Educational", [`What changes when you compare ${basis}?`, `Why ${basis} decide your best ${item}.`, `The one thing to check before a new ${item}.`], `Here is what most people miss: ${basis} change how a ${item} looks on you. HairApp shows the difference on your own face.`],
    ["Urgency", [`Your salon visit is soon. See it on you first.`, `Salon tomorrow? Check your ${item} tonight.`, `Don't book blind. See your ${item} now.`], `Salon appointment this week? Take thirty seconds, upload a photo to HairApp and walk in knowing exactly which ${item} you want.`],
    ["Testimonial", [`"I finally found my ${item} without a bad cut."`, `"I showed my stylist the exact ${item}."`, `"Best ${item} decision I ever made."`], `I have had so many bad cuts. This time I tried HairApp first, compared ${basis}, and finally found a ${item} I love.`],
    ["Playful", [`POV: you let AI pick your next ${item}.`, `Me vs. every ${item} in one minute.`, `AI picked my ${item} and I'm obsessed.`], `POV: you let AI pick your next ${item}. I uploaded a selfie to HairApp and honestly, it nailed it. Should I book it?`],
  ];
}

/** One theme's text in a given version (0 is the first). */
export function getScriptExample(category: CategoryId, kind: ScriptKind, index: number, version = 0): ScriptExample {
  const [theme, walls, voice] = exampleThemes(category)[index];
  const v = version % EXAMPLE_VERSIONS;
  if (kind === "wall-texts") return { theme, text: walls[v] };
  return { theme, text: v === 0 ? voice : `${walls[v]} ${VOICE_CTAS[v - 1]}` };
}

export function getScriptExamples(category: CategoryId, kind: ScriptKind): ScriptExample[] {
  return Array.from({ length: EXAMPLE_THEMES }, (_, i) => getScriptExample(category, kind, i));
}

/** Favorites key for an example: versions follow each other in blocks of twelve. */
export const exampleIteration = (index: number, version: number) =>
  EXAMPLE_ITERATION_BASE + (version % EXAMPLE_VERSIONS) * EXAMPLE_THEMES + index + 1;

export function parseExampleIteration(iteration: number) {
  const n = iteration - EXAMPLE_ITERATION_BASE - 1;
  return { index: n % EXAMPLE_THEMES, version: Math.floor(n / EXAMPLE_THEMES) };
}
