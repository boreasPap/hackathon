import { type CategoryId, getObservations } from "./sample-data";

// Sample insights written by hand from the reference set; no model reads the creatives yet.

export type CategoryInsights = { working: string[]; ideas: string[]; watchOuts: string[] };

const INSIGHTS: Record<CategoryId, Omit<CategoryInsights, "working">> = {
  hairstyle: {
    ideas: [
      "Open on a versus question (“Mullet or middle part?”) and let comments pick the winner.",
      "Show three looks in under five seconds, then slow down on the one that fits best.",
      "Try a “stylist reacts” angle: a pro rating AI hairstyles on camera.",
    ],
    watchOuts: [
      "Ten creatives in this set start with no on-screen hook; the first second carries the scroll.",
      "Keep the before shot natural; heavy filters make the transformation feel fake.",
      "Most presenters are the same face; rotate talent before the audience tires of it.",
    ],
  },
  haircolor: {
    ideas: [
      "Run a swatch countdown: ten shades in fifteen seconds, ending on the most surprising one.",
      "Pair each color with a season or skin undertone to give viewers a reason to choose.",
      "Test a dare format: “The comments pick my next color.”",
    ],
    watchOuts: [
      "“Let’s Choose” opens several creatives; vary the hook so they do not compete with each other.",
      "Colors shift on phone screens; show the swatch next to the result so it reads true.",
      "Avoid promising a real salon result; frame it as a preview.",
    ],
  },
  "golden-ratio": {
    ideas: [
      "Show the proportion lines being drawn over the face; the overlay is the hook.",
      "Compare two celebrities’ ratios side by side before revealing the viewer’s own.",
      "End on a haircut that “fixes” the ratio, so the app becomes the next step.",
    ],
    watchOuts: [
      "Beauty scores can read as judgmental; keep the tone curious, never rating someone down.",
      "Short hooks like “When” or “The” do not explain the idea; spell out the promise early.",
      "Do not mix face-shape and golden-ratio claims in one video; it blurs the message.",
    ],
  },
  faceshape: {
    ideas: [
      "Draw the face outline on camera, then swap three haircuts that suit that shape.",
      "Build a series per shape (round, oval, long) so each viewer finds their episode.",
      "Use a “same haircut, different faces” split screen to prove why shape matters.",
    ],
    watchOuts: [
      "“You’re not ugly” style hooks get attention but can feel negative; test a softer variant.",
      "Make sure the outline overlay stays readable on small screens.",
      "Three creatives share the same hook; refresh the opening line before the next batch.",
    ],
  },
};

export const getCategoryInsights = (category: CategoryId): CategoryInsights => ({
  working: getObservations(category),
  ...INSIGHTS[category],
});
