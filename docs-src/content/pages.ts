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
      "A lightweight frontend error reporting SDK designed to POST normalized client error payloads to any endpoint you control.",
    body: `
      <p><strong>@revivejs/client-errors</strong> is built for real production apps that need client-side runtime error reporting without buying into a hosted platform, dashboard, or vendor backend. It captures errors, collects safe context, normalizes everything into one payload shape, and ships it to any endpoint you define.</p>
      <p>The package stays framework-agnostic on purpose. The core runs in plain browsers today, and future React, Angular, and Vue wrappers can stay thin because they will reuse this same runtime.</p>
    `
  },
  {
    id: "installation",
    title: "Installation",
    eyebrow: "Quick start",
    description:
      "The simplest setup is a single relative endpoint path and a normal POST request.",
    body: `
      ${codeBlock(`npm install @revivejs/client-errors`, "bash")}
      ${codeBlock(`import { initClientErrors } from "@revivejs/client-errors";

initClientErrors({
  endpoint: "api/frontend-errors"
});`)}
      <p>Absolute URLs are also supported, but the documentation examples default to a relative path because that fits the most common browser-to-app-backend setup.</p>
    `
  },
  {
    id: "transport",
    title: "Transport & Auth",
    eyebrow: "Backend agnostic",
    description:
      "Use pure POST with no authentication, bearer token auth, custom headers, dynamic headers, or cookie-based requests.",
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
    `
  },
  {
    id: "api",
    title: "API",
    eyebrow: "Public surface",
    description:
      "The SDK exposes both initialization and manual capture APIs for domain-specific reporting.",
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
} from "@revivejs/client-errors";

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
    id: "sanitization",
    title: "Sanitization",
    eyebrow: "Privacy-aware",
    description:
      "Safe defaults are on by default, and the sanitization layer is configurable for enterprise rules.",
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
      <p>The SDK applies truncation and redaction before transport so the payload stays practical and safer to process on the backend.</p>
    `
  },
  {
    id: "limitations",
    title: "Limitations",
    eyebrow: "Notes",
    description:
      "The package is intentionally focused on client error reporting, not observability platform scope.",
    body: `
      <ul>
        <li>It does not include a hosted dashboard, replay service, or vendor backend.</li>
        <li>Screenshot capture is optional and best-effort. Cross-origin assets and browser restrictions can limit fidelity.</li>
        <li>The SDK is designed to fail silent. If transport or screenshot capture fails, the host app should keep working normally.</li>
        <li>Absolute endpoints are supported too, even though the docs examples use a relative path by default.</li>
      </ul>
    `
  }
];
