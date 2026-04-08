import type { ClientErrorsSanitizeConfig } from "../types";

const toNormalizedSet = (values: string[] | undefined): Set<string> =>
  new Set((values ?? []).map((value) => value.trim().toLowerCase()).filter(Boolean));

export const createSanitizeSets = (config: ClientErrorsSanitizeConfig) => ({
  redactKeys: toNormalizedSet(config.redactKeys),
  redactHeaders: toNormalizedSet(config.redactHeaders),
  redactQueryParams: toNormalizedSet(config.redactQueryParams),
  redactBodyPaths: toNormalizedSet(config.redactBodyPaths)
});

export const shouldRedactKey = (key: string, config: ClientErrorsSanitizeConfig): boolean =>
  createSanitizeSets(config).redactKeys.has(key.trim().toLowerCase());

export const shouldRedactPath = (
  path: string[],
  config: ClientErrorsSanitizeConfig
): boolean => {
  const value = path.join(".").trim().toLowerCase();

  if (!value) {
    return false;
  }

  const sets = createSanitizeSets(config);
  return sets.redactBodyPaths.has(value) || sets.redactKeys.has(path[path.length - 1]?.toLowerCase() ?? "");
};

export const redactUrl = (value: string, config: ClientErrorsSanitizeConfig): string => {
  const replacement = config.replacementText ?? "[Redacted]";
  const sets = createSanitizeSets(config);

  if (!sets.redactQueryParams.size) {
    return value;
  }

  try {
    const base =
      typeof window !== "undefined" && window.location?.href
        ? window.location.href
        : "http://localhost/";
    const url = new URL(value, base);

    sets.redactQueryParams.forEach((key) => {
      if (url.searchParams.has(key)) {
        url.searchParams.set(key, replacement);
      }
    });

    if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value)) {
      return url.toString();
    }

    if (value.startsWith("?")) {
      return url.search;
    }

    if (value.startsWith("#")) {
      return url.hash;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return value;
  }
};
