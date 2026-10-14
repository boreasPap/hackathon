import { HttpError } from "./http";

// TypeScript port of example/eachlabsHelper.js (fetch instead of axios, no
// storage upload: output URLs are kept as eachlabs returns them).

export const TERMINAL_STATUSES = new Set(["completed", "failed", "cancelled"]);

export type Execution = {
  executionId: string;
  workflowId: string | null;
  status: string;
  output: unknown;
  /** The workflow's named outputs (its `output_mapping`), when it defines one. */
  workflowOutput: Record<string, unknown> | null;
  stepOutputs: Record<string, unknown> | null;
  error: unknown;
  errorCause: string | null;
  raw: Record<string, unknown>;
};

type ProviderErrorContext = {
  operation?: string;
  providerStatus?: string | null;
  httpStatus?: number | null;
  executionId?: string;
  response?: unknown;
};

export class EachlabsProviderError extends Error {
  provider = "eachlabs";
  operation?: string;
  providerStatus: string | null;
  httpStatus: number | null;
  executionId?: string;
  response: unknown;

  constructor(message: string, context: ProviderErrorContext = {}) {
    super(message);
    this.name = "EachlabsProviderError";
    this.operation = context.operation;
    this.providerStatus = context.providerStatus ?? null;
    this.httpStatus = context.httpStatus ?? null;
    this.executionId = context.executionId;
    this.response = context.response ?? null;
  }
}

const DEFAULT_BASE_URL = "https://api.eachlabs.ai";

function config() {
  const apiKey = process.env.EACHLABS_API_KEY;
  if (!apiKey) {
    throw new HttpError(500, "eachlabs is not set up: add EACHLABS_API_KEY to .env.local.");
  }
  const baseUrl = (process.env.EACHLABS_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
  return { apiKey, baseUrl, defaultVersion: process.env.EACHLABS_WORKFLOW_VERSION };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function providerMessage(data: unknown, fallback: string): string {
  if (!isRecord(data)) return fallback;
  const error = data.error;
  const message =
    data.error_cause ||
    (typeof error === "string" ? error : isRecord(error) ? error.message : null) ||
    data.message ||
    fallback;
  return String(message);
}

export async function eachlabsRequest(path: string, init: RequestInit, operation: string, executionId?: string) {
  const { apiKey, baseUrl } = config();
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
  } catch (error) {
    throw new EachlabsProviderError(error instanceof Error ? error.message : "Could not reach eachlabs", {
      operation,
      executionId,
    });
  }

  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new EachlabsProviderError(providerMessage(data, `eachlabs ${operation} failed (${response.status})`), {
      operation,
      httpStatus: response.status,
      executionId,
      response: data,
    });
  }
  return isRecord(data) ? data : {};
}

export async function triggerWorkflow({
  workflowId,
  versionId,
  inputs,
}: {
  workflowId: string;
  versionId?: string;
  inputs: Record<string, unknown>;
}): Promise<{ executionId: string; status: string }> {
  const version = versionId || config().defaultVersion;
  if (!version) {
    throw new HttpError(
      500,
      "eachlabs is not set up: add EACHLABS_WORKFLOW_VERSION to .env.local or a versionId to the workflow in aiModels.json.",
    );
  }

  const data = await eachlabsRequest(
    `/v1/workflows/trigger/${encodeURIComponent(workflowId)}/${encodeURIComponent(version)}`,
    { method: "POST", body: JSON.stringify({ inputs }) },
    "triggerWorkflow",
  );

  const executionId = data.execution_id;
  if (typeof executionId !== "string" || !executionId) {
    throw new EachlabsProviderError("eachlabs trigger response is missing execution_id", {
      operation: "triggerWorkflow",
      response: data,
    });
  }
  return { executionId, status: typeof data.status === "string" ? data.status : "queued" };
}

export async function getExecution(executionId: string): Promise<Execution> {
  const data = await eachlabsRequest(
    `/v1/workflows/executions/${encodeURIComponent(executionId)}`,
    { method: "GET" },
    "getExecution",
    executionId,
  );
  return {
    executionId: typeof data.execution_id === "string" ? data.execution_id : executionId,
    workflowId: typeof data.workflow_id === "string" ? data.workflow_id : null,
    status: String(data.status ?? "unknown"),
    output: data.output ?? null,
    workflowOutput: isRecord(data.workflow_output) ? data.workflow_output : null,
    stepOutputs: isRecord(data.step_outputs) ? data.step_outputs : null,
    error: data.error ?? null,
    errorCause: typeof data.error_cause === "string" ? data.error_cause : null,
    raw: data,
  };
}

export function extractOutputUrls(execution: Execution): string[] {
  const urls: string[] = [];
  const pushIfUrl = (value: unknown) => {
    if (typeof value === "string" && /^https?:\/\//i.test(value)) urls.push(value);
  };
  const collect = (value: unknown): void => {
    if (value == null) return;
    if (typeof value === "string") return pushIfUrl(value);
    if (Array.isArray(value)) return value.forEach(collect);
    if (isRecord(value)) {
      pushIfUrl(value.url || value.primary);
      if (value.output != null && value.output !== value) collect(value.output);
    }
  };

  collect(execution.output);
  if (urls.length === 0 && execution.stepOutputs) {
    for (const step of Object.values(execution.stepOutputs)) {
      if (!isRecord(step)) continue;
      pushIfUrl(step.primary);
      collect(step.output);
    }
  }
  return [...new Set(urls)];
}

function collectPayloads(execution: Execution): Record<string, unknown>[] {
  const payloads: unknown[] = [execution.output];
  if (execution.stepOutputs) {
    for (const step of Object.values(execution.stepOutputs)) {
      if (isRecord(step)) payloads.push(step.output, step.primary);
    }
  }
  return payloads.filter(isRecord);
}

export function findEmbeddedError(execution: Execution): string | null {
  for (const payload of collectPayloads(execution)) {
    const embedded = payload.error;
    if (!embedded) continue;
    const message = typeof embedded === "string" ? embedded : isRecord(embedded) ? embedded.message : null;
    return typeof message === "string" && message ? message : "eachlabs step returned an error";
  }
  return null;
}

/** The LLM text of a workflow: an OpenAI-style `choices[0].message.content`, or a plain string output. */
export function extractContent(execution: Execution): string | null {
  for (const payload of collectPayloads(execution)) {
    const choices = payload.choices;
    if (Array.isArray(choices)) {
      const content = (choices[0] as { message?: { content?: unknown } } | undefined)?.message?.content;
      if (typeof content === "string" && content.trim()) return content;
    }
  }
  const candidates = [execution.output, ...Object.values(execution.stepOutputs ?? {}).map((s) => (isRecord(s) ? s.output : null))];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim() && !/^https?:\/\//i.test(candidate.trim())) {
      return candidate;
    }
  }
  return null;
}

export function parseJsonContent(rawContent: string): unknown {
  const withoutFences = rawContent
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  return JSON.parse(withoutFences);
}

export function executionFailureMessage(execution: Execution): string {
  return execution.errorCause || providerMessage(execution.raw, `eachlabs workflow ${execution.status}`);
}
