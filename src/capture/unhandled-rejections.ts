import type { ClientErrorsState, PendingCaptureItem } from "../core/state";

type EnqueueCapture = (item: Omit<PendingCaptureItem, "eventId" | "timestamp">) => void;

export const registerUnhandledRejectionCapture = (
  state: ClientErrorsState,
  enqueue: EnqueueCapture
): (() => void) | undefined => {
  if (typeof window === "undefined" || !state.config.captureUnhandledRejections) {
    return undefined;
  }

  const handler = (event: PromiseRejectionEvent): void => {
    if (state.destroyed) {
      return;
    }

    enqueue({
      kind: "promise_rejection",
      source: "unhandledrejection",
      error: event.reason
    });
  };

  window.addEventListener("unhandledrejection", handler);
  return () => window.removeEventListener("unhandledrejection", handler);
};
