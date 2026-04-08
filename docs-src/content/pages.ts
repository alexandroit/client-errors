export interface DocsPage {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  body: string;
}

const codeBlock = (code: string, language = "ts"): string => `
  <pre><code class="language-${language}">${code
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")}</code></pre>
`;

export const pages: DocsPage[] = [
  {
    id: "overview",
    title: "Overview",
    eyebrow: "Browser SDK",
    description:
      "Capture browser runtime errors and send a normalized JSON payload to an endpoint you control.",
    body: `
      <p><strong>@stackline/client-errors</strong> captures frontend errors in the browser, collects basic request and page context, normalizes the result into a stable payload, and sends it with a POST request.</p>
      <p>The package is framework-agnostic. You can use it in plain browser applications today and wrap the same runtime later for React, Angular, or Vue.</p>
    `
  },
  {
    id: "installation",
    title: "Installation",
    eyebrow: "Quick start",
    description:
      "Install the package and initialize it with your ingest endpoint.",
    body: `
      ${codeBlock(`npm install @stackline/client-errors`, "bash")}
      ${codeBlock(`import { initClientErrors } from "@stackline/client-errors";

initClientErrors({
  endpoint: "api/frontend-errors"
});`)}
      <p>The examples in this documentation use a relative path. Absolute URLs are also supported when your ingest service is hosted elsewhere.</p>
    `
  },
  {
    id: "transport",
    title: "Transport & Auth",
    eyebrow: "Backend agnostic",
    description:
      "Use plain POST, bearer tokens, custom headers, dynamic headers, or cookie-based requests.",
    body: `
      ${codeBlock(`initClientErrors({
  endpoint: "api/frontend-errors"
});`)}
      ${codeBlock(`initClientErrors({
  endpoint: "api/frontend-errors",
  auth: {
    type: "bearer",
    token: "public-ingest-token"
  }
});`)}
      ${codeBlock(`initClientErrors({
  endpoint: "api/frontend-errors",
  auth: {
    type: "custom",
    headers: {
      "X-Ingest-Key": "demo-public-key"
    }
  },
  getHeaders: async () => ({
    "X-Session": window.sessionStorage.getItem("session") ?? "anonymous"
  }),
  credentials: "include"
});`)}
      <p>The SDK uses <code>fetch</code> and builds the request from your configuration. It does not depend on any specific backend product or hosted service.</p>
    `
  },
  {
    id: "api",
    title: "API",
    eyebrow: "Public surface",
    description:
      "Initialize the SDK once, then use the manual helpers when you need to report domain-specific failures.",
    body: `
      ${codeBlock(`import {
  addBreadcrumb,
  captureException,
  captureMessage,
  destroy,
  flush,
  initClientErrors,
  setCustomContext,
  setUserContext
} from "@stackline/client-errors";

const client = initClientErrors({
  endpoint: "api/frontend-errors",
  appName: "billing-ui",
  environment: "production",
  release: "1.2.0"
});

setUserContext({ id: "u_42", email: "team@example.com" });
setCustomContext({ tenantId: "tenant-acme" });
addBreadcrumb({ type: "checkout.step", value: "confirm-payment" });
await captureException(new Error("Checkout failed"));
await captureMessage("A recoverable warning", "warn");
await flush();
client.destroy();
destroy();`)}
    `
  },
  {
    id: "debug-context",
    title: "Debug Context",
    eyebrow: "DOM & source lines",
    description:
      "Optionally attach a sanitized HTML snippet and a few lines of source around the failing location.",
    body: `
      ${codeBlock(`initClientErrors({
  endpoint: "api/frontend-errors",
  dom: {
    enabled: true
  },
  sourceContext: {
    enabled: true,
    contextLines: 2
  }
});`)}
      <p>Use <code>dom.enabled</code> when you want a small sanitized HTML snippet near the failing element. Use <code>sourceContext.enabled</code> when you want nearby source lines for same-origin scripts. Both features are optional.</p>
    `
  },
  {
    id: "sanitization",
    title: "Sanitization",
    eyebrow: "Privacy-aware",
    description:
      "Redact sensitive fields before data leaves the browser.",
    body: `
      ${codeBlock(`initClientErrors({
  endpoint: "api/frontend-errors",
  sanitize: {
    enabled: true,
    redactKeys: ["password", "token", "authorization", "cookie"],
    redactHeaders: ["authorization", "cookie"],
    redactQueryParams: ["token", "session"],
    stripInputValues: {
      password: true,
      email: true,
      textarea: false
    },
    maskSelectors: [".masked-card-number"],
    removeSelectors: ["[data-private='true']"],
    maxStringLength: 1000,
    maxStackLength: 8000
  }
});`)}
      <p>The SDK truncates and redacts data before transport. You can keep the defaults or add stricter rules for your own application.</p>
    `
  },
  {
    id: "limitations",
    title: "Limitations",
    eyebrow: "Notes",
    description:
      "This package focuses on client-side error reporting.",
    body: `
      <ul>
        <li>It does not include a hosted dashboard, replay service, or backend service.</li>
        <li>Screenshot capture is optional and best-effort. Cross-origin assets and browser restrictions can affect the result.</li>
        <li>If transport or screenshot capture fails, the SDK drops the event instead of interrupting the host application.</li>
        <li>Both relative and absolute endpoints are supported.</li>
      </ul>
    `
  }
];
