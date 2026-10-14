const axios = require("axios");
const { StorageManager } = require("./storage");
const { LoggerHelper } = require("./loggerHelper");
const {
  EACHLABS_BASE_URL,
  EACHLABS_WORKFLOW_VERSION,
  EACHLABS_TIMEOUT,
  EACHLABS_POLL_INTERVAL_MS,
  CLOUD_FUNCTIONS_BASE_URL,
} = require("./constants");

const WORKFLOW_TERMINAL_STATUSES = new Set(["completed", "failed", "cancelled"]);

const logger = LoggerHelper.withContext("eachlabsHelper");
const storageManager = StorageManager.getInstance();

function authHeaders() {
  const apiKey = process.env.EACHLABS_API_KEY;
  if (!apiKey) {
    throw new Error("EACHLABS_API_KEY environment variable is not set");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createEachlabsProviderError(errorOrMessage, context = {}) {
  const axiosResponse =
    errorOrMessage && typeof errorOrMessage === "object"
      ? errorOrMessage.response
      : null;
  const response = context.response ?? axiosResponse?.data ?? null;
  const httpStatus = context.httpStatus ?? axiosResponse?.status ?? null;
  const responseError = response?.error;
  const rawMessage =
    response?.error_cause ||
    (typeof responseError === "string" ? responseError : responseError?.message) ||
    (typeof errorOrMessage === "string" ? errorOrMessage : errorOrMessage?.message) ||
    context.fallbackMessage ||
    "Eachlabs provider error";

  const message =
    typeof rawMessage === "string" ? rawMessage : String(rawMessage);

  const error = new Error(message);
  error.name = "EachlabsProviderError";
  error.provider = "eachlabs";
  error.operation = context.operation;
  error.providerStatus = context.providerStatus ?? response?.status ?? null;
  error.httpStatus = httpStatus;
  error.executionId = context.executionId;
  error.response = response;
  return error;
}

function throwEachlabsError(err, fallbackMessage, context = {}) {
  if (err && typeof err === "object" && err.name === "EachlabsProviderError") {
    throw err;
  }

  const response = err && typeof err === "object" ? err.response : null;
  throw createEachlabsProviderError(err, {
    ...context,
    fallbackMessage,
    httpStatus: response?.status,
    response: response?.data,
  });
}

function buildEachlabsInputs(inputObject = {}, requestConfig) {
  const extraConfigInputs = { ...(requestConfig?.input || {}) };
  delete extraConfigInputs.image_url;
  delete extraConfigInputs.image_urls;

  const prompt = requestConfig?.prompt || inputObject.prompt;

  return {
    ...extraConfigInputs,
    image_urls: inputObject.imageUrls || [],
    ...(prompt && { prompt }),
    language: inputObject.language || "en",
  };
}

async function triggerWorkflow({
  workflowId,
  versionId = EACHLABS_WORKFLOW_VERSION,
  inputs = {},
  webhookUrl,
  webhookSecret,
} = {}) {
  if (!workflowId) {
    throw new Error("workflowId is required");
  }

  const body = { inputs };
  if (webhookUrl) body.webhook_url = webhookUrl;
  if (webhookSecret) body.webhook_secret = webhookSecret;

  try {
    const response = await axios.post(
      `${EACHLABS_BASE_URL}/v1/workflows/trigger/${workflowId}/${versionId}`,
      body,
      { headers: authHeaders() },
    );

    const data = response.data || {};
    const executionId = data.execution_id;
    if (!executionId) {
      throw createEachlabsProviderError(
        "Eachlabs trigger response missing execution_id",
        {
          operation: "triggerWorkflow",
          httpStatus: response.status,
          response: data,
        },
      );
    }

    return {
      executionId,
      status: data.status || "queued",
    };
  } catch (err) {
    throwEachlabsError(err, "Eachlabs workflow trigger failed", {
      operation: "triggerWorkflow",
    });
  }
}

async function getExecution(executionId) {
  if (!executionId) {
    throw new Error("executionId is required");
  }

  try {
    const response = await axios.get(
      `${EACHLABS_BASE_URL}/v1/workflows/executions/${executionId}`,
      { headers: authHeaders() },
    );

    const data = response.data || {};
    return {
      executionId: data.execution_id || executionId,
      workflowId: data.workflow_id ?? null,
      status: data.status,
      output: data.output ?? null,
      stepOutputs: data.step_outputs ?? null,
      error: data.error ?? null,
      errorCause: data.error_cause ?? null,
      raw: data,
    };
  } catch (err) {
    throwEachlabsError(err, "Eachlabs getExecution failed", {
      operation: "getExecution",
      executionId,
    });
  }
}

async function subscribeWorkflow({
  workflowId,
  versionId = EACHLABS_WORKFLOW_VERSION,
  inputs = {},
  timeout = EACHLABS_TIMEOUT,
  pollInterval = EACHLABS_POLL_INTERVAL_MS,
} = {}) {
  const { executionId } = await triggerWorkflow({
    workflowId,
    versionId,
    inputs,
  });

  const deadline = Date.now() + timeout;

  while (true) {
    const execution = await getExecution(executionId);

    if (WORKFLOW_TERMINAL_STATUSES.has(execution.status)) {
      if (execution.status === "completed") {
        return execution;
      }

      throw createEachlabsProviderError(
        execution.errorCause || `Eachlabs workflow ${execution.status}`,
        {
          operation: "subscribeWorkflow",
          providerStatus: execution.status,
          executionId,
          response: execution.raw,
        },
      );
    }

    if (Date.now() >= deadline) {
      throw createEachlabsProviderError(
        `Eachlabs workflow timed out after ${timeout}ms (executionId=${executionId})`,
        {
          operation: "subscribeWorkflow",
          providerStatus: "timeout",
          executionId,
        },
      );
    }

    await sleep(pollInterval);
  }
}

function extractOutputUrls(result) {
  if (!result) return [];

  const urls = [];

  const pushIfUrl = (value) => {
    if (typeof value === "string" && /^https?:\/\//i.test(value)) {
      urls.push(value);
    }
  };

  const collectFromValue = (value) => {
    if (value == null) return;
    if (typeof value === "string") {
      pushIfUrl(value);
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        collectFromValue(item);
      }
      return;
    }
    if (typeof value === "object") {
      pushIfUrl(value.url || value.primary);
      if (value.output != null && value.output !== value) {
        collectFromValue(value.output);
      }
    }
  };

  collectFromValue(result.output);

  if (urls.length === 0 && result.stepOutputs && typeof result.stepOutputs === "object") {
    for (const step of Object.values(result.stepOutputs)) {
      if (!step || typeof step !== "object") continue;
      pushIfUrl(step.primary);
      collectFromValue(step.output);
    }
  }

  return [...new Set(urls)];
}

function collectExecutionPayloads(execution) {
  const payloads = [execution?.output];

  if (execution?.stepOutputs && typeof execution.stepOutputs === "object") {
    for (const step of Object.values(execution.stepOutputs)) {
      if (!step || typeof step !== "object") continue;
      payloads.push(step.output, step.primary);
    }
  }

  return payloads.filter((payload) => payload && typeof payload === "object");
}

function findEmbeddedError(execution) {
  for (const payload of collectExecutionPayloads(execution)) {
    const embedded = payload.error;
    if (!embedded) continue;

    const message =
      typeof embedded === "string" ? embedded : embedded.message;
    return message || "Eachlabs step returned an error";
  }

  return null;
}

function extractContent(execution) {
  for (const payload of collectExecutionPayloads(execution)) {
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content === "string" && content.trim()) {
      return content;
    }
  }

  return null;
}

function parseJsonContent(rawContent) {
  const withoutFences = rawContent
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();

  const parsed = JSON.parse(withoutFences);

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Eachlabs content is not a JSON object");
  }

  return parsed;
}

async function uploadEachlabsImageAndReturnResult(imageUrls, userId) {
  try {
    if (typeof imageUrls === "string") {
      const uploadedImageUrl = await storageManager.uploadFromUrl({
        url: imageUrls,
        subFolder: "",
        extension: "png",
        contentType: "image/png",
        userId,
        mainFolder: "output-images",
      });

      return {
        success: true,
        data: uploadedImageUrl,
      };
    }

    if (Array.isArray(imageUrls)) {
      const uploadedUrls = await Promise.all(
        imageUrls.map(async (url) => {
          return await storageManager.uploadFromUrl({
            url,
            subFolder: "",
            extension: "png",
            contentType: "image/png",
            userId,
            mainFolder: "output-images",
          });
        }),
      );

      return {
        success: true,
        data: uploadedUrls.length === 1 ? uploadedUrls[0] : uploadedUrls,
      };
    }

    return {
      success: false,
      message: "Invalid image URLs format",
    };
  } catch (uploadError) {
    logger.error(
      `Failed to upload Eachlabs image to storage for user: ${userId}`,
      uploadError,
    );

    return {
      success: false,
      message: `Failed to upload image to storage: ${uploadError.message}`,
    };
  }
}

function buildVideoWebhookUrl(functionName, userId, resultId) {
  let webhookUrl = `${CLOUD_FUNCTIONS_BASE_URL}/${functionName}?userId=${userId}`;
  if (resultId) webhookUrl += `&resultId=${resultId}`;
  return webhookUrl;
}

function buildEachlabsTextToImageInputs(inputObject = {}, requestConfig) {
  const extraConfigInputs = { ...(requestConfig?.input || {}) };
  delete extraConfigInputs.image_url;
  delete extraConfigInputs.image_urls;

  const prompt = requestConfig?.prompt || inputObject.prompt;

  return {
    ...extraConfigInputs,
    ...(prompt && { prompt }),
  };
}

async function callEachlabsTextToImage(workflowId, inputObject, requestConfig, userId) {
  try {
    const inputs = buildEachlabsTextToImageInputs(inputObject, requestConfig);
    const execution = await subscribeWorkflow({ workflowId, inputs });
    const outputUrls = extractOutputUrls(execution);

    if (!outputUrls.length) {
      return {
        success: false,
        message: "Eachlabs workflow completed but no output URL found",
      };
    }

    return await uploadEachlabsImageAndReturnResult(
      outputUrls.length === 1 ? outputUrls[0] : outputUrls,
      userId,
    );
  } catch (error) {
    logger.error(`Eachlabs Text-to-Image Generation Failed for user: ${userId}`, error);
    return {
      success: false,
      message: error.message || "Eachlabs image generation failed",
    };
  }
}

function buildEachlabsTextToTextInputs(inputObject = {}, requestConfig) {
  const extraConfigInputs = { ...(requestConfig?.input || {}) };
  delete extraConfigInputs.image_url;
  delete extraConfigInputs.image_urls;

  const prompt = requestConfig?.prompt || inputObject.prompt;
  const imageUrls = Array.isArray(inputObject.imageUrls) && inputObject.imageUrls.length
    ? inputObject.imageUrls
    : [""];

  return {
    ...extraConfigInputs,
    image_urls: imageUrls,
    ...(prompt && { prompt }),
  };
}

async function callEachlabsTextToText(workflowId, inputObject, requestConfig, userId) {
  try {
    const inputs = buildEachlabsTextToTextInputs(inputObject, requestConfig);
    const execution = await subscribeWorkflow({ workflowId, inputs });

    const embeddedError = findEmbeddedError(execution);
    if (embeddedError) {
      logger.error(
        `Eachlabs workflow reported completed but carried an error for user: ${userId}`,
        { workflowId, executionId: execution.executionId, embeddedError },
      );
      return { success: false, message: embeddedError };
    }

    const rawContent = extractContent(execution);
    if (!rawContent) {
      return {
        success: false,
        message: "Eachlabs workflow completed but no content found",
      };
    }

    return { success: true, data: rawContent };
  } catch (error) {
    logger.error(`Eachlabs Text-to-Text Generation Failed for user: ${userId}`, error);
    return {
      success: false,
      message: error.message || "Eachlabs text generation failed",
    };
  }
}

async function callEachlabsImageToImage(workflowId, inputObject, requestConfig, userId) {
  try {
    const inputs = buildEachlabsInputs(inputObject, requestConfig);
    const execution = await subscribeWorkflow({ workflowId, inputs });
    const outputUrls = extractOutputUrls(execution);

    if (!outputUrls.length) {
      return {
        success: false,
        message: "Eachlabs workflow completed but no output URL found",
      };
    }

    return await uploadEachlabsImageAndReturnResult(
      outputUrls.length === 1 ? outputUrls[0] : outputUrls,
      userId,
    );
  } catch (error) {
    logger.error(`Eachlabs Image-to-Image Generation Failed for user: ${userId}`, error);
    return {
      success: false,
      message: error.message || "Eachlabs image generation failed",
    };
  }
}

async function callEachlabsImageToText(workflowId, inputObject, requestConfig, userId) {
  try {
    const inputs = buildEachlabsInputs(inputObject, requestConfig);
    logger.info(`[callEachlabsImageToText] Eachlabs Image-to-Text inputs: ${JSON.stringify(inputs)}`);

    const execution = await subscribeWorkflow({ workflowId, inputs });

    const embeddedError = findEmbeddedError(execution);
    if (embeddedError) {
      logger.error(
        `Eachlabs workflow reported completed but carried an error for user: ${userId}`,
        { workflowId, executionId: execution.executionId, embeddedError },
      );
      return { success: false, message: embeddedError };
    }

    const rawContent = extractContent(execution);
    if (!rawContent) {
      return {
        success: false,
        message: "Eachlabs workflow completed but no content found",
      };
    }

    try {
      return { success: true, data: parseJsonContent(rawContent) };
    } catch (parseError) {
      logger.error(
        `Failed to parse Eachlabs content for user: ${userId}`,
        { workflowId, executionId: execution.executionId, message: parseError.message },
      );
      return {
        success: false,
        message: "Eachlabs content is not valid JSON",
      };
    }
  } catch (error) {
    logger.error(
      `Eachlabs Image-to-Text Generation Failed for user: ${userId}`,
      error,
    );
    return {
      success: false,
      message: error.message || "Eachlabs text generation failed",
    };
  }
}

async function triggerEachlabsVideoWorkflow({
  workflowId,
  inputObject,
  requestConfig,
  userId,
  resultId,
  webhookFunctionName,
}) {
  try {
    const inputs = buildEachlabsInputs(inputObject, requestConfig);
    const { executionId } = await triggerWorkflow({
      workflowId,
      inputs,
      webhookUrl: buildVideoWebhookUrl(webhookFunctionName, userId, resultId),
      webhookSecret: process.env.EACHLABS_WEBHOOK_SECRET,
    });

    return {
      success: true,
      requestId: executionId,
    };
  } catch (error) {
    logger.error(
      `Eachlabs video generation failed for user: ${userId}`,
      error,
    );
    return {
      success: false,
      message: error.message || "Eachlabs video generation failed",
    };
  }
}

async function callEachlabsImageToVideo(
  workflowId,
  inputObject,
  requestConfig,
  userId,
  resultId = null,
) {
  return triggerEachlabsVideoWorkflow({
    workflowId,
    inputObject,
    requestConfig,
    userId,
    resultId,
    webhookFunctionName: "imageToVideoEachlabsWebhook",
  });
}

async function callEachlabsTextToVideo(
  workflowId,
  inputObject,
  requestConfig,
  userId,
  resultId = null,
) {
  return triggerEachlabsVideoWorkflow({
    workflowId,
    inputObject,
    requestConfig,
    userId,
    resultId,
    webhookFunctionName: "textToVideoEachlabsWebhook",
  });
}

module.exports = {
  buildEachlabsInputs,
  triggerWorkflow,
  getExecution,
  subscribeWorkflow,
  extractOutputUrls,
  findEmbeddedError,
  extractContent,
  parseJsonContent,
  callEachlabsImageToImage,
  callEachlabsTextToImage,
  callEachlabsTextToText,
  callEachlabsImageToText,
  callEachlabsImageToVideo,
  callEachlabsTextToVideo,
};
