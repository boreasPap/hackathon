import { promises as fs } from "node:fs";
import path from "node:path";
import type { AiModel } from "../types";
import { HttpError } from "./http";

// Read on every request, so a workflow ID typed into aiModels.json takes
// effect without restarting the server.
const AI_MODELS_PATH = path.join(process.cwd(), "src/features/creative-library/data/aiModels.json");

const PLACEHOLDER_IDS = new Set(["", "WORKFLOW_ID"]);

export async function readAiModels(): Promise<AiModel[]> {
  const raw = await fs.readFile(AI_MODELS_PATH, "utf8");
  const parsed = JSON.parse(raw) as AiModel | AiModel[];
  return Array.isArray(parsed) ? parsed : [parsed];
}

export function isConfigured(model: AiModel): boolean {
  return typeof model.apiUsageModels === "string" && !PLACEHOLDER_IDS.has(model.apiUsageModels.trim());
}

/** The eachlabs model for a step, or a 400 that says what to fill in. */
export async function requireAiModel(subModelType: AiModel["subModelType"], label: string): Promise<AiModel> {
  const model = (await readAiModels()).find((m) => m.subModelType === subModelType && m.platform === "eachlabs");
  if (!model) {
    throw new HttpError(400, `There is no ${label} workflow in aiModels.json.`);
  }
  if (!isConfigured(model)) {
    throw new HttpError(
      400,
      `The ${label} workflow is not configured yet. Add its workflow ID to "${model.id}" in aiModels.json.`,
    );
  }
  return model;
}
