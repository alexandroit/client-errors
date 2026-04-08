import type { ClientErrorsState, PendingCaptureItem } from "../core/state";
import { safeCall } from "../utils/safe-run";

type EnqueueCapture = (item: Omit<PendingCaptureItem, "eventId" | "timestamp">) => void;

const getResourceUrl = (target: EventTarget | null): string | undefined => {
  if (!(target instanceof Element)) {
    return undefined;
  }

  return safeCall(() => {
    if ("src" in target && typeof target.src === "string") {
      return target.src;
    }

    if ("href" in target && typeof target.href === "string") {
      return target.href;
    }

    return undefined;
  }, undefined);
};

export const registerWindowErrorCapture = (
  state: ClientErrorsState,
  enqueue: EnqueueCapture
): (() => void) | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  const handler = (event: ErrorEvent | Event): void => {
    if (state.destroyed) {
      return;
    }

    const target = event.target ?? null;
    const isResourceError = target && target !== window;

    if (isResourceError) {
      if (!state.config.captureResourceErrors) {
        return;
      }

      enqueue({
        kind: "resource",
        source: "window.error",
        target,
        fileName: getResourceUrl(target)
      });
      return;
    }

    if (!state.config.captureWindowErrors) {
      return;
    }

    const errorEvent = event as ErrorEvent;

    enqueue({
      kind: "exception",
      source: "window.error",
      error: errorEvent.error ?? new Error(errorEvent.message || "Unknown window error"),
      message: errorEvent.message,
      fileName: errorEvent.filename,
      line: errorEvent.lineno,
      column: errorEvent.colno
    });
  };

  window.addEventListener("error", handler, true);
  return () => window.removeEventListener("error", handler, true);
};
