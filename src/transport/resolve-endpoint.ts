import type { ClientErrorsConfig } from "../types";
import { safeCallAsync } from "../utils/safe-run";

const isAbsoluteUrl = (value: string): boolean => /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value);

export const resolveEndpoint = async (
  endpoint: ClientErrorsConfig["endpoint"]
): Promise<string | null> => {
  const rawValue = await safeCallAsync(
    () => (typeof endpoint === "function" ? endpoint() : endpoint),
    ""
  );

  if (typeof rawValue !== "string") {
    return null;
  }

  const trimmed = rawValue.trim();

  if (!trimmed) {
    return null;
  }

  try {
    if (isAbsoluteUrl(trimmed)) {
      return new URL(trimmed).toString();
    }

    if (typeof window === "undefined" || typeof window.location?.href !== "string") {
      return null;
    }

    return new URL(trimmed, window.location.href).toString();
  } catch {
    return null;
  }
};
