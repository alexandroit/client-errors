import type { ClientErrorsState } from "../core/state";
import type { ClientErrorsBreadcrumb } from "../types";
import { describeElement } from "../utils/dom";
import { pushBounded, truncateString } from "../utils/limits";
import { nowIso } from "../utils/time";
import { safeSideEffect } from "../utils/safe-run";

const createBreadcrumb = (
  state: ClientErrorsState,
  breadcrumb: Omit<ClientErrorsBreadcrumb, "timestamp"> & { timestamp?: string }
): ClientErrorsBreadcrumb => ({
  ...breadcrumb,
  value: truncateString(
    breadcrumb.value,
    state.config.sanitize.maxBreadcrumbValueLength ?? 240
  ),
  timestamp: breadcrumb.timestamp ?? nowIso()
});

export const recordBreadcrumb = (
  state: ClientErrorsState,
  breadcrumb: Omit<ClientErrorsBreadcrumb, "timestamp"> & { timestamp?: string }
): void => {
  if (!state.config.breadcrumbs.enabled) {
    return;
  }

  pushBounded(
    state.breadcrumbs,
    createBreadcrumb(state, breadcrumb),
    state.config.breadcrumbs.maxEntries
  );
};

export const registerBreadcrumbCapture = (state: ClientErrorsState): Array<() => void> => {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    !state.config.breadcrumbs.enabled
  ) {
    return [];
  }

  const cleanups: Array<() => void> = [];

  if (state.config.breadcrumbs.captureClicks) {
    const clickHandler = (event: MouseEvent): void => {
      if (state.destroyed) {
        return;
      }

      recordBreadcrumb(state, {
        type: "ui.click",
        value: describeElement(event.target)
      });
    };

    document.addEventListener("click", clickHandler, true);
    cleanups.push(() => document.removeEventListener("click", clickHandler, true));
  }

  if (state.config.breadcrumbs.captureNavigation) {
    const addNavigationBreadcrumb = (type: string): void => {
      recordBreadcrumb(state, {
        type,
        value: window.location.href
      });
    };

    const popStateHandler = (): void => addNavigationBreadcrumb("navigation.popstate");
    const hashChangeHandler = (): void => addNavigationBreadcrumb("navigation.hashchange");

    window.addEventListener("popstate", popStateHandler);
    window.addEventListener("hashchange", hashChangeHandler);
    cleanups.push(() => window.removeEventListener("popstate", popStateHandler));
    cleanups.push(() => window.removeEventListener("hashchange", hashChangeHandler));

    if (window.history?.pushState) {
      state.originalPushState = window.history.pushState.bind(window.history);
      window.history.pushState = function (...args) {
        const result = state.originalPushState?.(...args);
        safeSideEffect(() => addNavigationBreadcrumb("navigation.pushState"));
        return result as void;
      };
      cleanups.push(() => {
        if (state.originalPushState) {
          window.history.pushState = state.originalPushState;
        }
      });
    }

    if (window.history?.replaceState) {
      state.originalReplaceState = window.history.replaceState.bind(window.history);
      window.history.replaceState = function (...args) {
        const result = state.originalReplaceState?.(...args);
        safeSideEffect(() => addNavigationBreadcrumb("navigation.replaceState"));
        return result as void;
      };
      cleanups.push(() => {
        if (state.originalReplaceState) {
          window.history.replaceState = state.originalReplaceState;
        }
      });
    }
  }

  return cleanups;
};
