import type { ClientErrorsPayload, ClientErrorsViewport } from "../types";
import type { PendingCaptureItem, ClientErrorsState } from "../core/state";
import { normalizeError } from "./error";
import { captureDomContext, getDomTarget } from "./dom-context";
import { captureSourceContext } from "./source-context";
import { safeCall } from "../utils/safe-run";
import { safeClone } from "../utils/serialize";

const getViewport = (): ClientErrorsViewport | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
};

const getScreen = (): ClientErrorsViewport | undefined => {
  if (typeof window === "undefined" || !window.screen) {
    return undefined;
  }

  return {
    width: window.screen.width,
    height: window.screen.height
  };
};

const getPageContext = () => {
  if (typeof window === "undefined") {
    return {
      url: ""
    };
  }

  return {
    url: window.location.href,
    path: window.location.pathname,
    query: window.location.search || undefined,
    referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
    title: typeof document !== "undefined" ? document.title || undefined : undefined
  };
};

const getBrowserContext = () => {
  if (typeof navigator === "undefined") {
    return undefined;
  }

  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    viewport: getViewport(),
    screen: getScreen()
  };
};

export const buildPayload = (
  state: ClientErrorsState,
  item: PendingCaptureItem,
  screenshotDataUrl?: string | null
): Promise<ClientErrorsPayload> => {
  const app =
    state.config.appName || state.config.environment || state.config.release
      ? {
          name: state.config.appName,
          environment: state.config.environment,
          release: state.config.release
        }
      : undefined;

  const userFromProvider = safeCall(() => state.config.getUserContext?.(), undefined);
  const customFromProvider = safeCall(() => state.config.getCustomContext?.(), undefined);
  const mergedUser = {
    ...(safeClone(userFromProvider) ?? {}),
    ...(safeClone(state.userContext) ?? {}),
    ...(safeClone(item.extra?.user) ?? {})
  };
  const mergedCustom = {
    ...(safeClone(customFromProvider) ?? {}),
    ...(safeClone(state.customContext) ?? {}),
    ...(safeClone(item.extra?.custom) ?? {})
  };
  const normalizedError = normalizeError(item);
  const domContext = state.config.dom.enabled
    ? captureDomContext(getDomTarget(item), state.config.dom.rootSelector, state.config.sanitize)
    : undefined;

  return captureSourceContext(
    state,
    normalizedError.fileName,
    normalizedError.line,
    normalizedError.column
  ).then((sourceContext) => ({
    schemaVersion: "1.0",
    eventId: item.eventId,
    timestamp: item.timestamp,
    app,
    page: getPageContext(),
    browser: getBrowserContext(),
    error: {
      ...normalizedError,
      ...(domContext ? { dom: domContext } : {}),
      ...(sourceContext ? { sourceContext } : {})
    },
    console: state.consoleEntries.slice(),
    breadcrumbs: [...state.breadcrumbs, ...(item.extra?.breadcrumbs ?? [])],
    network: item.extra?.network?.slice(),
    screenshot:
      screenshotDataUrl && state.config.screenshot.includeInPayload
        ? {
            format: state.config.screenshot.format,
            dataUrl: screenshotDataUrl
          }
        : undefined,
    user: Object.keys(mergedUser).length ? mergedUser : undefined,
    custom: Object.keys(mergedCustom).length
      ? {
          ...mergedCustom,
          ...(item.extra?.tags ? { tags: item.extra.tags } : {})
        }
      : item.extra?.tags
        ? { tags: item.extra.tags }
        : undefined
  }));
};
