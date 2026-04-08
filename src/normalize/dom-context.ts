import type {
  ClientErrorsDomContext,
  ClientErrorsSanitizeConfig
} from "../types";
import type { PendingCaptureItem } from "../core/state";
import { applyDomSanitization } from "../sanitize/core";
import { describeElement } from "../utils/dom";
import { truncateString } from "../utils/limits";
import { safeCall } from "../utils/safe-run";

const CONTAINER_SELECTORS = [
  "[data-client-errors-snippet]",
  "[role='dialog']",
  "form",
  "main",
  "section",
  "article",
  "table",
  ".modal",
  ".dialog",
  ".card"
].join(", ");

const getElement = (target: EventTarget | null | undefined): Element | null =>
  typeof Element !== "undefined" && target instanceof Element ? target : null;

const getSnippetRoot = (
  target: Element | null,
  rootSelector: string | undefined
): Element | null => {
  if (target) {
    if (rootSelector?.trim()) {
      const explicitRoot = safeCall(() => target.closest(rootSelector), null);
      if (explicitRoot) {
        return explicitRoot;
      }
    }

    const container = safeCall(() => target.closest(CONTAINER_SELECTORS), null);
    if (container) {
      return container;
    }

    return target;
  }

  if (typeof document === "undefined") {
    return null;
  }

  return document.body instanceof Element ? document.body : null;
};

const compactHtml = (html: string): string =>
  html
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .trim();

export const captureDomContext = (
  target: EventTarget | null | undefined,
  rootSelector: string | undefined,
  sanitizeConfig: ClientErrorsSanitizeConfig
): ClientErrorsDomContext | undefined => {
  const targetElement = getElement(target);
  const activeElement =
    typeof document !== "undefined" ? getElement(document.activeElement) : null;
  const root = getSnippetRoot(targetElement ?? activeElement, rootSelector);

  const domContext: ClientErrorsDomContext = {
    target: describeElement(targetElement ?? activeElement),
    activeElement: activeElement ? describeElement(activeElement) : undefined
  };

  if (!root) {
    return domContext.target || domContext.activeElement ? domContext : undefined;
  }

  const clone = safeCall(() => root.cloneNode(true), null);
  if (!(clone instanceof Element)) {
    return domContext.target || domContext.activeElement ? domContext : undefined;
  }

  clone.querySelectorAll("script, style, noscript").forEach((node) => node.remove());
  applyDomSanitization(clone, sanitizeConfig);

  const snippet = truncateString(
    compactHtml(clone.outerHTML),
    sanitizeConfig.maxDomSnippetLength ?? 4000
  );

  return {
    ...domContext,
    snippet
  };
};

export const getDomTarget = (item: PendingCaptureItem): EventTarget | null | undefined =>
  item.target ?? item.extra?.target;
