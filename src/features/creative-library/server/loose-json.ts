/**
 * An LLM answer as JSON, with or without ``` fences around it, or the first
 * `{…}` block inside it. Never throws: anything unreadable becomes `{}`.
 */
export function parseLooseJson<T = Record<string, unknown>>(input: unknown): Partial<T> {
  if (input && typeof input === "object") return input as Partial<T>;
  if (typeof input !== "string") return {};

  const cleaned = input.replace(/```(?:json)?/g, "").trim();
  const block = cleaned.match(/\{[\s\S]*\}/)?.[0];
  for (const candidate of [cleaned, block]) {
    if (!candidate) continue;
    try {
      const value: unknown = JSON.parse(candidate);
      if (value && typeof value === "object") return value as Partial<T>;
    } catch {
      // try the next candidate
    }
  }
  return {};
}
