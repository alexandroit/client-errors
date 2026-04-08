import { createClientErrors } from "./core/client";
import type {
  ClientErrorsBreadcrumb,
  ClientErrorsCaptureExtra,
  ClientErrorsConfig,
  ClientErrorsInstance,
  ClientErrorsMessageLevel,
  ClientErrorsPayload,
  ClientErrorsUserContext
} from "./types";

let activeClient: ClientErrorsInstance | null = null;

export const initClientErrors = (config: ClientErrorsConfig): ClientErrorsInstance => {
  activeClient?.destroy();
  activeClient = createClientErrors(config);
  return activeClient;
};

export const captureException = (
  error: unknown,
  extra?: ClientErrorsCaptureExtra
): Promise<string | null> => activeClient?.captureException(error, extra) ?? Promise.resolve(null);

export const captureMessage = (
  message: string,
  level?: ClientErrorsMessageLevel,
  extra?: ClientErrorsCaptureExtra
): Promise<string | null> => activeClient?.captureMessage(message, level, extra) ?? Promise.resolve(null);

export const addBreadcrumb = (
  breadcrumb: Omit<ClientErrorsBreadcrumb, "timestamp"> & { timestamp?: string }
): void => {
  activeClient?.addBreadcrumb(breadcrumb);
};

export const setUserContext = (userContext?: ClientErrorsUserContext): void => {
  activeClient?.setUserContext(userContext);
};

export const setCustomContext = (customContext?: Record<string, unknown>): void => {
  activeClient?.setCustomContext(customContext);
};

export const flush = (): Promise<void> => activeClient?.flush() ?? Promise.resolve();

export const destroy = (): void => {
  activeClient?.destroy();
  activeClient = null;
};

export { createClientErrors };
export type {
  ClientErrorsAuth,
  ClientErrorsBreadcrumb,
  ClientErrorsBreadcrumbConfig,
  ClientErrorsBrowserContext,
  ClientErrorsCaptureExtra,
  ClientErrorsConfig,
  ClientErrorsConsoleEntry,
  ClientErrorsDomConfig,
  ClientErrorsDomContext,
  ClientErrorsInstance,
  ClientErrorsMessageLevel,
  ClientErrorsNetworkEntry,
  ClientErrorsNormalizedError,
  ClientErrorsPageContext,
  ClientErrorsPayload,
  ClientErrorsRateLimitConfig,
  ClientErrorsSanitizeConfig,
  ClientErrorsSanitizeTransformContext,
  ClientErrorsSourceContext,
  ClientErrorsSourceContextConfig,
  ClientErrorsSourceContextLine,
  ClientErrorsScreenshotConfig,
  ClientErrorsTransportResponse,
  ClientErrorsUserContext,
  ClientErrorsViewport
} from "./types";
