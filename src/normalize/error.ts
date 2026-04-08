import type { ClientErrorsNormalizedError } from "../types";
import type { PendingCaptureItem } from "../core/state";
import { describeElement } from "../utils/dom";
import { safeSerialize } from "../utils/serialize";

const getErrorMessage = (value: unknown): string => {
  if (value instanceof Error && value.message) {
    return value.message;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && value && "message" in value && typeof value.message === "string") {
    return value.message;
  }

  return safeSerialize(value);
};

const getErrorStack = (value: unknown): string | undefined => {
  if (value instanceof Error && typeof value.stack === "string") {
    return value.stack;
  }

  if (typeof value === "object" && value && "stack" in value && typeof value.stack === "string") {
    return value.stack;
  }

  return undefined;
};

export const normalizeError = (item: PendingCaptureItem): ClientErrorsNormalizedError => {
  if (item.kind === "resource") {
    return {
      type: "resource",
      name: "ResourceLoadError",
      message: `Failed to load resource: ${describeElement(item.target ?? null)}`,
      fileName: item.fileName,
      line: item.line,
      column: item.column
    };
  }

  if (item.kind === "message") {
    return {
      type: item.source || "message",
      name: "CapturedMessage",
      message: item.message ?? "Unknown message"
    };
  }

  if (item.kind === "console") {
    return {
      type: item.source || "console",
      name: "ConsoleCapture",
      message: item.message ?? "Captured console entry"
    };
  }

  const error = item.error ?? item.extra?.originalError;
  const name =
    error instanceof Error
      ? error.name
      : typeof error === "object" && error && "name" in error && typeof error.name === "string"
        ? error.name
        : undefined;

  return {
    type: item.kind,
    name,
    message: item.message ?? getErrorMessage(error),
    stack: getErrorStack(error),
    fileName: item.fileName,
    line: item.line,
    column: item.column
  };
};
