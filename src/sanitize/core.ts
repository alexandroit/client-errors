import type {
  ClientErrorsConsoleEntry,
  ClientErrorsPayload,
  ClientErrorsSanitizeConfig,
  ClientErrorsSanitizeTransformContext
} from "../types";
import { truncateString } from "../utils/limits";
import { isObject, isPlainObject } from "../utils/object";
import { createSanitizeSets, redactUrl, shouldRedactKey, shouldRedactPath } from "./redact";

const getStringMaximum = (
  config: ClientErrorsSanitizeConfig,
  source: ClientErrorsSanitizeTransformContext["source"],
  path: string[]
): number => {
  if (source === "console") {
    return config.maxConsoleEntryLength ?? 1000;
  }

  if (source === "breadcrumb") {
    return config.maxBreadcrumbValueLength ?? 240;
  }

  if (path[path.length - 1] === "stack") {
    return config.maxStackLength ?? 8000;
  }

  if (path[path.length - 1] === "snippet") {
    return config.maxDomSnippetLength ?? 4000;
  }

  return config.maxStringLength ?? 1000;
};

const sanitizePrimitive = (
  value: unknown,
  config: ClientErrorsSanitizeConfig,
  context: ClientErrorsSanitizeTransformContext
): unknown => {
  const transformed = config.transform ? config.transform(value, context) : value;

  if (typeof transformed === "string") {
    const maximum = getStringMaximum(config, context.source, context.path);
    const maybeUrl = context.path[context.path.length - 1] === "url" || context.source === "query";
    const nextValue = maybeUrl ? redactUrl(transformed, config) : transformed;
    return truncateString(nextValue, maximum);
  }

  return transformed;
};

export const sanitizeValue = (
  value: unknown,
  config: ClientErrorsSanitizeConfig,
  context: ClientErrorsSanitizeTransformContext
): unknown => {
  if (config.enabled === false) {
    return value;
  }

  if (
    value == null ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "string"
  ) {
    return sanitizePrimitive(value, config, context);
  }

  if (Array.isArray(value)) {
    return value.map((entry, index) =>
      sanitizeValue(entry, config, {
        ...context,
        path: [...context.path, String(index)]
      })
    );
  }

  if (!isObject(value)) {
    return sanitizePrimitive(String(value), config, context);
  }

  if (!isPlainObject(value)) {
    return sanitizePrimitive(String(value), config, context);
  }

  const output: Record<string, unknown> = {};

  for (const [key, entry] of Object.entries(value)) {
    const nextPath = [...context.path, key];

    if (shouldRedactKey(key, config) || shouldRedactPath(nextPath, config)) {
      output[key] = config.replacementText ?? "[Redacted]";
      continue;
    }

    if (context.source === "headers" && createSanitizeSets(config).redactHeaders.has(key.toLowerCase())) {
      output[key] = config.replacementText ?? "[Redacted]";
      continue;
    }

    output[key] = sanitizeValue(entry, config, {
      ...context,
      key,
      path: nextPath
    });
  }

  return output;
};

export const sanitizeConsoleEntries = (
  entries: ClientErrorsConsoleEntry[],
  config: ClientErrorsSanitizeConfig
): ClientErrorsConsoleEntry[] => {
  const maxEntries = config.maxConsoleEntries ?? 20;
  const limitedEntries = entries.slice(-maxEntries);

  return limitedEntries.map((entry) => ({
    ...entry,
    message: truncateString(
      redactUrl(entry.message, config),
      config.maxConsoleEntryLength ?? 1000
    )
  }));
};

export const sanitizePayload = (
  payload: ClientErrorsPayload,
  config: ClientErrorsSanitizeConfig
): ClientErrorsPayload => {
  const sanitized = sanitizeValue(payload, config, {
    path: [],
    source: "payload"
  }) as ClientErrorsPayload;

  if (sanitized.page?.url) {
    sanitized.page.url = redactUrl(sanitized.page.url, config);
  }

  if (sanitized.page?.query) {
    sanitized.page.query = redactUrl(sanitized.page.query, config);
  }

  if (sanitized.console) {
    sanitized.console = sanitizeConsoleEntries(sanitized.console, config);
  }

  if (sanitized.breadcrumbs) {
    sanitized.breadcrumbs = sanitized.breadcrumbs.map((entry) => ({
      ...entry,
      value: truncateString(
        redactUrl(entry.value, config),
        config.maxBreadcrumbValueLength ?? 240
      )
    }));
  }

  return sanitized;
};

const shouldStripInputValue = (
  element: HTMLInputElement | HTMLTextAreaElement,
  config: ClientErrorsSanitizeConfig
): boolean => {
  if (config.stripInputValues === true) {
    return true;
  }

  if (!config.stripInputValues || typeof config.stripInputValues !== "object") {
    return false;
  }

  if (element instanceof HTMLTextAreaElement) {
    return config.stripInputValues.textarea ?? false;
  }

  const type = element.type.toLowerCase() || "text";
  return config.stripInputValues[type as keyof typeof config.stripInputValues] ?? false;
};

export const applyDomSanitization = (
  root: ParentNode,
  config: ClientErrorsSanitizeConfig
): void => {
  if (config.enabled === false) {
    return;
  }

  const replacement = config.replacementText ?? "[Redacted]";

  config.removeSelectors?.forEach((selector) => {
    root.querySelectorAll(selector).forEach((node) => node.remove());
  });

  config.maskSelectors?.forEach((selector) => {
    root.querySelectorAll<HTMLElement>(selector).forEach((node) => {
      node.textContent = replacement;
    });
  });

  root
    .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea")
    .forEach((element) => {
      if (shouldStripInputValue(element, config)) {
        element.value = replacement;
        element.setAttribute("value", replacement);
        if (element instanceof HTMLTextAreaElement) {
          element.textContent = replacement;
        }
      }
    });
};
