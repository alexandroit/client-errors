import { truncateString } from "./limits";
import { safeCall } from "./safe-run";

export const describeElement = (target: EventTarget | null): string => {
  if (typeof Element === "undefined" || !(target instanceof Element)) {
    return "unknown";
  }

  const tagName = target.tagName.toLowerCase();
  const id = target.id ? `#${target.id}` : "";
  const className = typeof target.className === "string" && target.className.trim()
    ? `.${target.className.trim().split(/\s+/).slice(0, 2).join(".")}`
    : "";
  const text = truncateString(
    safeCall(() => target.textContent?.trim() ?? "", ""),
    64
  );
  const textSuffix = text ? ` "${text}"` : "";

  return `${tagName}${id}${className}${textSuffix}`;
};
