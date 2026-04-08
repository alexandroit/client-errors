import type {
  ClientErrorsConsoleEntry,
  ClientErrorsMessageLevel
} from "../types";
import type { ClientErrorsState, PendingCaptureItem } from "../core/state";
import { pushBounded, truncateString } from "../utils/limits";
import { nowIso } from "../utils/time";
import { safeSerialize } from "../utils/serialize";

type EnqueueCapture = (item: Omit<PendingCaptureItem, "eventId" | "timestamp">) => void;

const formatConsoleArgs = (args: unknown[]): string =>
  args
    .map((value) => {
      if (typeof value === "string") {
        return value;
      }

      return safeSerialize(value);
    })
    .join(" ");

const createConsoleEntry = (
  state: ClientErrorsState,
  level: ClientErrorsMessageLevel,
  args: unknown[]
): ClientErrorsConsoleEntry => ({
  level,
  message: truncateString(
    formatConsoleArgs(args),
    state.config.sanitize.maxConsoleEntryLength ?? 1000
  ),
  timestamp: nowIso()
});

export const registerConsoleCapture = (
  state: ClientErrorsState,
  enqueue: EnqueueCapture
): Array<() => void> => {
  if (typeof console === "undefined") {
    return [];
  }

  const cleanups: Array<() => void> = [];
  const patchMethod = (
    level: "error" | "warn",
    enabled: boolean
  ): void => {
    if (!enabled) {
      return;
    }

    const original = console[level];
    state.originalConsole[level] = original.bind(console);

    console[level] = (...args: Parameters<typeof console.error>) => {
      original.apply(console, args);

      if (state.destroyed || state.recursionGuard > 0) {
        return;
      }

      const entry = createConsoleEntry(state, level, args);
      pushBounded(
        state.consoleEntries,
        entry,
        state.config.sanitize.maxConsoleEntries ?? 20
      );

      enqueue({
        kind: "console",
        source: `console.${level}`,
        level,
        message: entry.message
      });
    };

    cleanups.push(() => {
      if (state.originalConsole[level]) {
        console[level] = state.originalConsole[level]!;
      }
    });
  };

  patchMethod("error", state.config.captureConsoleErrors);
  patchMethod("warn", state.config.captureConsoleWarnings);
  return cleanups;
};
