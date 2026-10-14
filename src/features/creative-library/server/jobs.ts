import { ITERATION_TABS } from "../constants";
import type { Creative, Iteration, IterationType } from "../types";
import { readAiModels, requireAiModel } from "./ai-models";
import { findCreative, getCreative, updateDb } from "./db";
import {
  EachlabsProviderError,
  type Execution,
  executionFailureMessage,
  getExecution,
  TERMINAL_STATUSES,
  triggerWorkflow,
} from "./eachlabs";
import { HttpError, newId } from "./http";
import { buildAnalysisInputs, buildIterationInputs } from "./inputs";
import { parseExtraction, parseIterationItems } from "./results";

// Long eachlabs runs are tracked by polling, not webhooks (eachlabs cannot
// reach localhost): a start call triggers the workflow and stores its
// execution id; the page then calls `syncCreative` until nothing is running.

export async function startAnalysis(creativeId: string): Promise<Creative> {
  const creative = await getCreative(creativeId);
  if (creative.analysis.status === "running") {
    throw new HttpError(409, "This video is already being analyzed.");
  }
  const model = await requireAiModel("creativeAnalysis", "Video Analysis");
  const inputs = buildAnalysisInputs(creative, model);
  const { executionId } = await triggerWorkflow({ workflowId: model.apiUsageModels, versionId: model.versionId, inputs });

  return updateDb((db) => {
    const c = findCreative(db, creativeId);
    c.analysis = {
      ...c.analysis,
      status: "running",
      executionId,
      aiModelId: model.id,
      error: null,
      startedAt: new Date().toISOString(),
      completedAt: null,
    };
    c.updatedAt = new Date().toISOString();
    return c;
  });
}

export async function startIteration(
  creativeId: string,
  type: IterationType,
  userPrompt: string | null,
): Promise<Creative> {
  const label = ITERATION_TABS.find((t) => t.type === type)?.label ?? type;
  const creative = await getCreative(creativeId);
  const model = await requireAiModel(type, label);
  const inputs = buildIterationInputs(creative, type, model, userPrompt);
  const { executionId } = await triggerWorkflow({ workflowId: model.apiUsageModels, versionId: model.versionId, inputs });

  const now = new Date().toISOString();
  const iteration: Iteration = {
    id: newId("it"),
    type,
    aiModelId: model.id,
    status: "running",
    executionId,
    error: null,
    prompt: userPrompt,
    inputs,
    items: [],
    raw: null,
    createdAt: now,
    completedAt: null,
  };

  return updateDb((db) => {
    const c = findCreative(db, creativeId);
    c.iterations.unshift(iteration);
    c.updatedAt = now;
    return c;
  });
}

type Poll = { execution: Execution } | { failure: string } | null;

async function poll(executionId: string | null): Promise<Poll> {
  if (!executionId) return { failure: "The run has no execution id." };
  try {
    const execution = await getExecution(executionId);
    return TERMINAL_STATUSES.has(execution.status) ? { execution } : null;
  } catch (error) {
    // eachlabs does not know this run: stop waiting for it. Anything else
    // (network, 5xx) is retried on the next sync.
    if (error instanceof EachlabsProviderError && error.httpStatus === 404) {
      return { failure: error.message };
    }
    if (error instanceof HttpError) throw error;
    console.error("[creative-library] sync", error);
    return null;
  }
}

function settle<T>(result: Poll, parse: (execution: Execution) => T) {
  if (!result) return null;
  if ("failure" in result) return { ok: false as const, error: result.failure, raw: null };
  const { execution } = result;
  if (execution.status !== "completed") {
    return { ok: false as const, error: executionFailureMessage(execution), raw: execution.raw };
  }
  try {
    return { ok: true as const, value: parse(execution), raw: execution.raw };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Could not read the result.", raw: execution.raw };
  }
}

/** Checks every running job of a creative on eachlabs and stores finished ones. */
export async function syncCreative(creativeId: string): Promise<Creative> {
  const creative = await getCreative(creativeId);
  const running = creative.iterations.filter((it) => it.status === "running");
  if (creative.analysis.status !== "running" && running.length === 0) return creative;

  const models = await readAiModels();

  const analysisResult =
    creative.analysis.status === "running"
      ? settle(await poll(creative.analysis.executionId), parseExtraction)
      : null;

  const iterationResults = await Promise.all(
    running.map(async (it) => {
      const model = models.find((m) => m.id === it.aiModelId) ?? models.find((m) => m.subModelType === it.type);
      const result = await poll(it.executionId);
      if (!model) return { id: it.id, result: result && { ok: false as const, error: `Workflow ${it.aiModelId} is no longer in aiModels.json.`, raw: null } };
      return { id: it.id, result: settle(result, (e) => parseIterationItems(e, model)) };
    }),
  );

  if (!analysisResult && iterationResults.every((r) => !r.result)) return creative;

  return updateDb((db) => {
    const c = findCreative(db, creativeId);
    const now = new Date().toISOString();

    if (analysisResult && c.analysis.status === "running") {
      c.analysis = {
        ...c.analysis,
        status: analysisResult.ok ? "completed" : "failed",
        error: analysisResult.ok ? null : analysisResult.error,
        completedAt: now,
        raw: analysisResult.raw,
      };
      if (analysisResult.ok) c.extracted = analysisResult.value;
    }

    for (const { id, result } of iterationResults) {
      const it = c.iterations.find((x) => x.id === id);
      if (!result || !it || it.status !== "running") continue;
      it.status = result.ok ? "completed" : "failed";
      it.error = result.ok ? null : result.error;
      it.items = result.ok ? result.value : [];
      it.raw = result.raw;
      it.completedAt = now;
    }

    c.updatedAt = now;
    return c;
  });
}
