import type {
  ClientErrorsAuth,
  ClientErrorsBreadcrumbConfig,
  ClientErrorsRateLimitConfig,
  ClientErrorsSanitizeConfig,
  ClientErrorsScreenshotConfig
} from "../types";

export const DEFAULT_METHOD = "POST" as const;

export const DEFAULT_AUTH: ClientErrorsAuth = {
  type: "none"
};

export const DEFAULT_BREADCRUMBS: Required<ClientErrorsBreadcrumbConfig> = {
  enabled: true,
  maxEntries: 25,
  captureClicks: true,
  captureNavigation: true
};

export const DEFAULT_SCREENSHOT: Required<
  Omit<ClientErrorsScreenshotConfig, "provider">
> = {
  enabled: false,
  format: "image/jpeg",
  quality: 0.82,
  maxWidth: 1440,
  maxHeight: 1200,
  includeInPayload: true
};

export const DEFAULT_SANITIZE: Required<
  Omit<ClientErrorsSanitizeConfig, "transform" | "stripInputValues">
> & {
  stripInputValues: false;
} = {
  enabled: true,
  redactKeys: ["password", "token", "authorization", "cookie", "secret", "apikey", "apiKey"],
  redactHeaders: ["authorization", "cookie", "x-api-key"],
  redactQueryParams: ["password", "token", "authorization", "cookie", "apikey", "apiKey"],
  redactBodyPaths: ["password", "token", "authorization", "cookie", "secret"],
  maskSelectors: [],
  removeSelectors: [],
  stripInputValues: false,
  maxStringLength: 1000,
  maxStackLength: 8000,
  maxConsoleEntryLength: 1000,
  maxConsoleEntries: 20,
  maxBreadcrumbValueLength: 240,
  maxDomSnippetLength: 4000,
  replacementText: "[Redacted]"
};

export const DEFAULT_RATE_LIMIT: Required<ClientErrorsRateLimitConfig> = {
  maxEvents: 10,
  perMilliseconds: 60_000
};
