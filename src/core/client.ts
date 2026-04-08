import { registerBreadcrumbCapture, recordBreadcrumb } from "../capture/breadcrumbs";
import { registerConsoleCapture } from "../capture/console";
import { registerUnhandledRejectionCapture } from "../capture/unhandled-rejections";
import { registerWindowErrorCapture } from "../capture/window-errors";
import { buildPayload } from "../normalize/payload";
import { sanitizePayload } from "../sanitize/core";
import { captureScreenshot } from "../screenshot/capture";
import { sendPayload } from "../transport/fetch";
import type {
  ClientErrorsBreadcrumb,
  ClientErrorsCaptureExtra,
  ClientErrorsConfig,
  ClientErrorsInstance,
  ClientErrorsMessageLevel,
  ClientErrorsPayload,
  ClientErrorsUserContext
} from "../types";
import { createEventId } from "../utils/id";
import { safeClone } from "../utils/serialize";
import { safeCall, safeCallAsync, safeSideEffect } from "../utils/safe-run";
import { nowIso } from "../utils/time";
import { resolveConfig } from "./config";
import { enqueueCaptureItem, flushQueue, scheduleQueueDrain } from "./queue";
import { isDuplicatePayload, isRateLimited } from "./reliability";
import { createState, type ClientErrorsState, type PendingCaptureItem } from "./state";

const processPendingCapture = async (
  state: ClientErrorsState,
  item: PendingCaptureItem
): Promise<void> => {
  if (state.destroyed || !state.config.enabled) {
    return;
  }

  const timestampMs = Date.parse(item.timestamp) || Date.now();
  state.recursionGuard += 1;

  try {
    let payload = sanitizePayload(await buildPayload(state, item), state.config.sanitize);

    if (isRateLimited(state, timestampMs) || isDuplicatePayload(state, payload, timestampMs)) {
      return;
    }

    const shouldSend = safeCall(() => state.config.shouldSend?.(payload) ?? true, true);

    if (!shouldSend) {
      return;
    }

    if (state.config.screenshot.enabled) {
      const screenshotDataUrl = await captureScreenshot(state.config.screenshot, state.config.sanitize);

      if (screenshotDataUrl && state.config.screenshot.includeInPayload) {
        payload = {
          ...payload,
          screenshot: {
            format: state.config.screenshot.format,
            dataUrl: screenshotDataUrl
          }
        };
      }
    }

    const finalPayload = await safeCallAsync<ClientErrorsPayload | null>(
      () => state.config.beforeSend?.(payload) ?? payload,
      payload
    );

    if (!finalPayload) {
      return;
    }

    const response = await sendPayload(state.config, finalPayload);

    if (response.ok) {
      safeSideEffect(() => state.config.onSuccess?.(finalPayload, response));
      return;
    }

    safeSideEffect(() =>
      state.config.onError?.(
        new Error(`Client errors transport responded with ${response.status} ${response.statusText}`)
      )
    );
  } catch (error) {
    safeSideEffect(() => state.config.onError?.(error));
  } finally {
    state.recursionGuard = Math.max(0, state.recursionGuard - 1);
  }
};

const createPendingCapture = (
  input: Omit<PendingCaptureItem, "eventId" | "timestamp">
): PendingCaptureItem => ({
  eventId: createEventId(),
  timestamp: nowIso(),
  ...input
});

const createEnqueue = (state: ClientErrorsState) => (item: Omit<PendingCaptureItem, "eventId" | "timestamp">): string | null => {
  if (state.destroyed || !state.config.enabled) {
    return null;
  }

  const pendingItem = createPendingCapture(item);
  enqueueCaptureItem(state, pendingItem, async (queuedItem) => processPendingCapture(state, queuedItem));
  return pendingItem.eventId;
};

const destroyState = (state: ClientErrorsState): void => {
  if (state.destroyed) {
    return;
  }

  state.destroyed = true;
  state.cleanupTasks.splice(0, state.cleanupTasks.length).forEach((cleanup) => cleanup());
  state.queue = [];
  state.flushResolvers.splice(0, state.flushResolvers.length).forEach((resolve) => resolve());
};

export const createClientErrors = (config: ClientErrorsConfig): ClientErrorsInstance => {
  const resolvedConfig = resolveConfig(config);
  const state = createState(resolvedConfig);
  const enqueue = createEnqueue(state);

  const windowErrorCleanup = registerWindowErrorCapture(state, enqueue);
  const rejectionCleanup = registerUnhandledRejectionCapture(state, enqueue);
  const consoleCleanups = registerConsoleCapture(state, enqueue);
  const breadcrumbCleanups = registerBreadcrumbCapture(state);

  state.cleanupTasks.push(
    ...breadcrumbCleanups,
    ...consoleCleanups,
    ...(windowErrorCleanup ? [windowErrorCleanup] : []),
    ...(rejectionCleanup ? [rejectionCleanup] : [])
  );

  const instance: ClientErrorsInstance = {
    get config() {
      return { ...state.config };
    },
    async captureException(error: unknown, extra?: ClientErrorsCaptureExtra): Promise<string | null> {
      return enqueue({
        kind: "exception",
        source: extra?.source ?? "manual.exception",
        error,
        target: extra?.target,
        extra: {
          ...extra,
          originalError: extra?.originalError ?? error
        }
      });
    },
    async captureMessage(
      message: string,
      level: ClientErrorsMessageLevel = "error",
      extra?: ClientErrorsCaptureExtra
    ): Promise<string | null> {
      return enqueue({
        kind: "message",
        source: extra?.source ?? "manual.message",
        level,
        message,
        target: extra?.target,
        extra
      });
    },
    addBreadcrumb(
      breadcrumb: Omit<ClientErrorsBreadcrumb, "timestamp"> & { timestamp?: string }
    ): void {
      recordBreadcrumb(state, breadcrumb);
    },
    setUserContext(userContext?: ClientErrorsUserContext): void {
      state.userContext = userContext ? safeClone(userContext) : undefined;
    },
    setCustomContext(customContext?: Record<string, unknown>): void {
      state.customContext = customContext ? safeClone(customContext) : undefined;
    },
    async flush(): Promise<void> {
      scheduleQueueDrain(state, async (item) => processPendingCapture(state, item));
      await flushQueue(state);
    },
    destroy(): void {
      destroyState(state);
    }
  };

  return instance;
};
