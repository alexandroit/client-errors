import type { ResolvedClientErrorsConfig } from "./config";
import type {
  ClientErrorsBreadcrumb,
  ClientErrorsCaptureExtra,
  ClientErrorsConsoleEntry,
  ClientErrorsMessageLevel,
  ClientErrorsUserContext
} from "../types";

export interface PendingCaptureItem {
  eventId: string;
  timestamp: string;
  kind: "exception" | "message" | "resource" | "promise_rejection" | "console";
  source: string;
  level?: ClientErrorsMessageLevel;
  error?: unknown;
  message?: string;
  fileName?: string;
  line?: number;
  column?: number;
  target?: EventTarget | null;
  extra?: ClientErrorsCaptureExtra;
}

export interface ClientErrorsState {
  config: ResolvedClientErrorsConfig;
  queue: PendingCaptureItem[];
  scheduled: boolean;
  processing: boolean;
  inFlight: number;
  destroyed: boolean;
  flushResolvers: Array<() => void>;
  cleanupTasks: Array<() => void>;
  breadcrumbs: ClientErrorsBreadcrumb[];
  consoleEntries: ClientErrorsConsoleEntry[];
  userContext?: ClientErrorsUserContext;
  customContext?: Record<string, unknown>;
  dedupeMap: Map<string, number>;
  rateWindow: number[];
  recursionGuard: number;
  sourceFileCache: Map<string, Promise<string | null>>;
  originalConsole: Partial<Record<"error" | "warn", typeof console.error>>;
  originalPushState?: History["pushState"];
  originalReplaceState?: History["replaceState"];
}

export const createState = (config: ResolvedClientErrorsConfig): ClientErrorsState => ({
  config,
  queue: [],
  scheduled: false,
  processing: false,
  inFlight: 0,
  destroyed: false,
  flushResolvers: [],
  cleanupTasks: [],
  breadcrumbs: [],
  consoleEntries: [],
  dedupeMap: new Map<string, number>(),
  rateWindow: [],
  recursionGuard: 0,
  sourceFileCache: new Map<string, Promise<string | null>>(),
  originalConsole: {}
});
