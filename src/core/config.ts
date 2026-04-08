import {
  DEFAULT_AUTH,
  DEFAULT_BREADCRUMBS,
  DEFAULT_METHOD,
  DEFAULT_RATE_LIMIT,
  DEFAULT_SANITIZE,
  DEFAULT_SCREENSHOT
} from "./defaults";
import type {
  ClientErrorsAuth,
  ClientErrorsBreadcrumbConfig,
  ClientErrorsConfig,
  ClientErrorsRateLimitConfig,
  ClientErrorsSanitizeConfig,
  ClientErrorsScreenshotConfig
} from "../types";

export interface ResolvedClientErrorsConfig extends ClientErrorsConfig {
  method: "POST";
  enabled: boolean;
  debug: boolean;
  auth: ClientErrorsAuth;
  headers: Record<string, string>;
  credentials: RequestCredentials;
  timeoutMs: number;
  maxRetries: number;
  captureWindowErrors: boolean;
  captureUnhandledRejections: boolean;
  captureConsoleErrors: boolean;
  captureConsoleWarnings: boolean;
  captureResourceErrors: boolean;
  breadcrumbs: Required<ClientErrorsBreadcrumbConfig>;
  screenshot: Required<Omit<ClientErrorsScreenshotConfig, "provider">> & {
    provider?: ClientErrorsScreenshotConfig["provider"];
  };
  sanitize: ClientErrorsSanitizeConfig;
  rateLimit: Required<ClientErrorsRateLimitConfig>;
  dedupeWindowMs: number;
}

const mergeSanitizeConfig = (
  input: ClientErrorsSanitizeConfig | undefined
): ClientErrorsSanitizeConfig => {
  const stripInputValues =
    typeof input?.stripInputValues === "object"
      ? {
          text: input.stripInputValues.text ?? false,
          email: input.stripInputValues.email ?? false,
          password: input.stripInputValues.password ?? true,
          search: input.stripInputValues.search ?? false,
          tel: input.stripInputValues.tel ?? false,
          url: input.stripInputValues.url ?? false,
          textarea: input.stripInputValues.textarea ?? false
        }
      : input?.stripInputValues ?? DEFAULT_SANITIZE.stripInputValues;

  return {
    ...DEFAULT_SANITIZE,
    ...input,
    stripInputValues
  };
};

export const resolveConfig = (config: ClientErrorsConfig): ResolvedClientErrorsConfig => {
  const breadcrumbs = {
    ...DEFAULT_BREADCRUMBS,
    ...config.breadcrumbs
  };

  const screenshot = {
    ...DEFAULT_SCREENSHOT,
    ...config.screenshot
  };

  const sanitize = mergeSanitizeConfig(config.sanitize);
  const rateLimit = {
    ...DEFAULT_RATE_LIMIT,
    ...config.rateLimit
  };

  return {
    ...config,
    method: DEFAULT_METHOD,
    enabled: config.enabled ?? true,
    debug: config.debug ?? false,
    auth: config.auth ?? DEFAULT_AUTH,
    headers: config.headers ?? {},
    credentials: config.credentials ?? "omit",
    timeoutMs: config.timeoutMs ?? 6000,
    maxRetries: config.maxRetries ?? 0,
    captureWindowErrors: config.captureWindowErrors ?? true,
    captureUnhandledRejections: config.captureUnhandledRejections ?? true,
    captureConsoleErrors: config.captureConsoleErrors ?? false,
    captureConsoleWarnings: config.captureConsoleWarnings ?? false,
    captureResourceErrors: config.captureResourceErrors ?? false,
    breadcrumbs,
    screenshot,
    sanitize,
    rateLimit,
    dedupeWindowMs: config.dedupeWindowMs ?? 3000
  };
};
