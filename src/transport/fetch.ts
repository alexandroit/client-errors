import type {
  ClientErrorsPayload,
  ClientErrorsTransportResponse
} from "../types";
import type { ResolvedClientErrorsConfig } from "../core/config";
import { resolveEndpoint } from "./resolve-endpoint";
import { safeCallAsync } from "../utils/safe-run";

const KEEPALIVE_BODY_LIMIT_BYTES = 60 * 1024;

const getBodySize = (body: string): number => {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(body).length;
  }

  return body.length;
};

const shouldUseKeepalive = (payload: ClientErrorsPayload, body: string): boolean => {
  if (payload.screenshot?.dataUrl) {
    return false;
  }

  return getBodySize(body) <= KEEPALIVE_BODY_LIMIT_BYTES;
};

const buildAuthHeaders = (config: ResolvedClientErrorsConfig): Record<string, string> => {
  if (config.auth.type === "bearer") {
    return {
      Authorization: `Bearer ${config.auth.token}`
    };
  }

  if (config.auth.type === "custom") {
    return {
      ...config.auth.headers
    };
  }

  return {};
};

const buildHeaders = async (
  config: ResolvedClientErrorsConfig
): Promise<Record<string, string>> => {
  const dynamicHeaders = await safeCallAsync(
    () => config.getHeaders?.() ?? {},
    {}
  );

  return {
    "Content-Type": "application/json",
    ...config.headers,
    ...buildAuthHeaders(config),
    ...dynamicHeaders
  };
};

const createTimeoutSignal = (
  timeoutMs: number
): {
  signal?: AbortSignal;
  cleanup: () => void;
} => {
  if (typeof AbortController === "undefined") {
    return {
      cleanup: () => {}
    };
  }

  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    cleanup: () => globalThis.clearTimeout(timeout)
  };
};

const wait = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => {
    globalThis.setTimeout(resolve, milliseconds);
  });

export const sendPayload = async (
  config: ResolvedClientErrorsConfig,
  payload: ClientErrorsPayload
): Promise<ClientErrorsTransportResponse> => {
  const endpoint = await resolveEndpoint(config.endpoint);

  if (!endpoint || typeof fetch !== "function") {
    throw new Error("Client errors endpoint could not be resolved.");
  }

  const headers = await buildHeaders(config);
  const body = JSON.stringify(payload);
  const keepalive = shouldUseKeepalive(payload, body);
  let attempt = 0;
  let lastError: unknown = new Error("Client errors transport failed.");

  while (attempt <= config.maxRetries) {
    const { signal, cleanup } = createTimeoutSignal(config.timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: config.method,
        headers,
        body,
        credentials: config.credentials,
        keepalive,
        signal
      });

      cleanup();

      return {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      };
    } catch (error) {
      cleanup();
      lastError = error;
      attempt += 1;

      if (attempt <= config.maxRetries) {
        await wait(150 * attempt);
      }
    }
  }

  throw lastError;
};
