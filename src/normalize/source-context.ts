import type { ClientErrorsSourceContext, ClientErrorsSourceContextLine } from "../types";
import type { ClientErrorsState } from "../core/state";
import { truncateString } from "../utils/limits";
import { safeCallAsync } from "../utils/safe-run";

const SOURCE_SEGMENT_RADIUS = 120;

const resolveSourceUrl = (fileName: string): URL | null => {
  if (typeof window === "undefined" || !window.location?.href) {
    return null;
  }

  try {
    return new URL(fileName, window.location.href);
  } catch {
    return null;
  }
};

const isFetchableSource = (url: URL): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  return url.origin === window.location.origin;
};

const loadSourceText = async (
  state: ClientErrorsState,
  fileUrl: URL
): Promise<string | null> => {
  const cacheKey = fileUrl.href;
  const cached = state.sourceFileCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const request = safeCallAsync(async () => {
    const response = await fetch(cacheKey, {
      method: "GET",
      credentials: "same-origin",
      cache: "force-cache"
    });

    if (!response.ok) {
      return null;
    }

    return response.text();
  }, null);

  state.sourceFileCache.set(cacheKey, request);
  return request;
};

const createSingleLineContext = (
  content: string,
  line: number,
  column?: number
): ClientErrorsSourceContextLine[] => {
  const focusIndex = Math.max(0, (column ?? 1) - 1);
  const start = Math.max(0, focusIndex - SOURCE_SEGMENT_RADIUS);
  const end = Math.min(content.length, focusIndex + SOURCE_SEGMENT_RADIUS);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < content.length ? "..." : "";

  return [
    {
      number: line,
      content: `${prefix}${content.slice(start, end)}${suffix}`,
      highlight: true
    }
  ];
};

const extractSourceLines = (
  sourceText: string,
  line?: number,
  column?: number,
  contextLines = 2
): ClientErrorsSourceContextLine[] | undefined => {
  if (!line || line < 1) {
    return undefined;
  }

  const lines = sourceText.split(/\r?\n/);
  const targetIndex = line - 1;
  const targetLine = lines[targetIndex];

  if (typeof targetLine !== "string") {
    return undefined;
  }

  if (lines.length === 1 || targetLine.length > 360) {
    return createSingleLineContext(targetLine, line, column);
  }

  const start = Math.max(0, targetIndex - contextLines);
  const end = Math.min(lines.length - 1, targetIndex + contextLines);
  const output: ClientErrorsSourceContextLine[] = [];

  for (let index = start; index <= end; index += 1) {
    output.push({
      number: index + 1,
      content: truncateString(lines[index] ?? "", 500),
      highlight: index === targetIndex
    });
  }

  return output;
};

export const captureSourceContext = async (
  state: ClientErrorsState,
  fileName: string | undefined,
  line: number | undefined,
  column: number | undefined
): Promise<ClientErrorsSourceContext | undefined> => {
  if (!fileName) {
    return undefined;
  }

  const output: ClientErrorsSourceContext = {
    fileName,
    line,
    column
  };

  if (!state.config.sourceContext.enabled) {
    return output;
  }

  const fileUrl = resolveSourceUrl(fileName);
  if (!fileUrl || !isFetchableSource(fileUrl)) {
    return output;
  }

  const sourceText = await loadSourceText(state, fileUrl);
  if (!sourceText) {
    return output;
  }

  const lines = extractSourceLines(
    sourceText,
    line,
    column,
    state.config.sourceContext.contextLines
  );

  if (!lines?.length) {
    return output;
  }

  return {
    ...output,
    lines
  };
};
