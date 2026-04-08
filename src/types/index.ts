export type ClientErrorsMessageLevel = "error" | "warn" | "info" | "log";

export type ClientErrorsAuth =
  | { type: "none" }
  | { type: "bearer"; token: string }
  | { type: "custom"; headers: Record<string, string> };

export interface ClientErrorsRateLimitConfig {
  maxEvents?: number;
  perMilliseconds?: number;
}

export interface ClientErrorsBreadcrumbConfig {
  enabled?: boolean;
  maxEntries?: number;
  captureClicks?: boolean;
  captureNavigation?: boolean;
}

export interface ClientErrorsStripInputValuesConfig {
  text?: boolean;
  email?: boolean;
  password?: boolean;
  search?: boolean;
  tel?: boolean;
  url?: boolean;
  textarea?: boolean;
}

export interface ClientErrorsSanitizeTransformContext {
  path: string[];
  key?: string;
  source:
    | "payload"
    | "page"
    | "query"
    | "headers"
    | "console"
    | "breadcrumb"
    | "user"
    | "custom"
    | "screenshot";
}

export interface ClientErrorsSanitizeConfig {
  enabled?: boolean;
  redactKeys?: string[];
  redactHeaders?: string[];
  redactQueryParams?: string[];
  redactBodyPaths?: string[];
  maskSelectors?: string[];
  removeSelectors?: string[];
  stripInputValues?: boolean | ClientErrorsStripInputValuesConfig;
  maxStringLength?: number;
  maxStackLength?: number;
  maxConsoleEntryLength?: number;
  maxConsoleEntries?: number;
  maxBreadcrumbValueLength?: number;
  maxDomSnippetLength?: number;
  replacementText?: string;
  transform?: (value: unknown, context: ClientErrorsSanitizeTransformContext) => unknown;
}

export interface ClientErrorsScreenshotCaptureContext {
  format: "image/jpeg" | "image/png";
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  sanitize: ClientErrorsSanitizeConfig;
}

export interface ClientErrorsScreenshotConfig {
  enabled?: boolean;
  format?: "image/jpeg" | "image/png";
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  includeInPayload?: boolean;
  provider?: (
    context: ClientErrorsScreenshotCaptureContext
  ) => string | null | Promise<string | null>;
}

export interface ClientErrorsAppContext {
  name?: string;
  environment?: string;
  release?: string;
}

export interface ClientErrorsViewport {
  width?: number;
  height?: number;
}

export interface ClientErrorsPageContext {
  url: string;
  path?: string;
  query?: string;
  referrer?: string;
  title?: string;
}

export interface ClientErrorsBrowserContext {
  userAgent?: string;
  language?: string;
  viewport?: ClientErrorsViewport;
  screen?: ClientErrorsViewport;
}

export interface ClientErrorsNormalizedError {
  type: string;
  name?: string;
  message: string;
  stack?: string;
  fileName?: string;
  line?: number;
  column?: number;
}

export interface ClientErrorsConsoleEntry {
  level: ClientErrorsMessageLevel;
  message: string;
  timestamp: string;
}

export interface ClientErrorsNetworkEntry {
  method?: string;
  url?: string;
  status?: number;
}

export interface ClientErrorsScreenshotPayload {
  format?: string;
  dataUrl?: string;
}

export interface ClientErrorsBreadcrumb {
  type: string;
  value: string;
  timestamp: string;
}

export interface ClientErrorsPayload {
  schemaVersion: "1.0";
  eventId: string;
  timestamp: string;
  app?: ClientErrorsAppContext;
  page: ClientErrorsPageContext;
  browser?: ClientErrorsBrowserContext;
  error: ClientErrorsNormalizedError;
  console?: ClientErrorsConsoleEntry[];
  breadcrumbs?: ClientErrorsBreadcrumb[];
  network?: ClientErrorsNetworkEntry[];
  screenshot?: ClientErrorsScreenshotPayload;
  user?: Record<string, unknown>;
  custom?: Record<string, unknown>;
}

export interface ClientErrorsCaptureExtra {
  source?: string;
  level?: ClientErrorsMessageLevel;
  tags?: Record<string, string>;
  user?: Record<string, unknown>;
  custom?: Record<string, unknown>;
  breadcrumbs?: ClientErrorsBreadcrumb[];
  console?: ClientErrorsConsoleEntry[];
  network?: ClientErrorsNetworkEntry[];
  originalError?: unknown;
}

export interface ClientErrorsTransportResponse {
  ok: boolean;
  status: number;
  statusText: string;
}

export interface ClientErrorsUserContext {
  id?: string | number;
  email?: string;
  username?: string;
  [key: string]: unknown;
}

export interface ClientErrorsConfig {
  endpoint: string | (() => string | Promise<string>);
  method?: "POST";
  enabled?: boolean;
  appName?: string;
  environment?: string;
  release?: string;
  debug?: boolean;
  auth?: ClientErrorsAuth;
  headers?: Record<string, string>;
  getHeaders?: () => Record<string, string> | Promise<Record<string, string>>;
  credentials?: RequestCredentials;
  timeoutMs?: number;
  maxRetries?: number;
  captureWindowErrors?: boolean;
  captureUnhandledRejections?: boolean;
  captureConsoleErrors?: boolean;
  captureConsoleWarnings?: boolean;
  captureResourceErrors?: boolean;
  breadcrumbs?: ClientErrorsBreadcrumbConfig;
  screenshot?: ClientErrorsScreenshotConfig;
  sanitize?: ClientErrorsSanitizeConfig;
  getUserContext?: () => Record<string, unknown> | undefined;
  getCustomContext?: () => Record<string, unknown> | undefined;
  beforeSend?: (
    payload: ClientErrorsPayload
  ) => ClientErrorsPayload | null | Promise<ClientErrorsPayload | null>;
  onSuccess?: (payload: ClientErrorsPayload, response: ClientErrorsTransportResponse) => void;
  onError?: (error: unknown) => void;
  shouldSend?: (payload: ClientErrorsPayload) => boolean;
  rateLimit?: ClientErrorsRateLimitConfig;
  dedupeWindowMs?: number;
}

export interface ClientErrorsInstance {
  readonly config: Readonly<ClientErrorsConfig>;
  captureException(error: unknown, extra?: ClientErrorsCaptureExtra): Promise<string | null>;
  captureMessage(
    message: string,
    level?: ClientErrorsMessageLevel,
    extra?: ClientErrorsCaptureExtra
  ): Promise<string | null>;
  addBreadcrumb(breadcrumb: Omit<ClientErrorsBreadcrumb, "timestamp"> & { timestamp?: string }): void;
  setUserContext(userContext?: ClientErrorsUserContext): void;
  setCustomContext(customContext?: Record<string, unknown>): void;
  flush(): Promise<void>;
  destroy(): void;
}
