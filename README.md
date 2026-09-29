# @stackline/client-errors

> A lightweight frontend error reporting SDK for browser applications, with normalized payloads, sanitization, and transport to any developer-defined endpoint.

[![npm version](https://img.shields.io/npm/v/@stackline/client-errors.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/client-errors)
[![license](https://img.shields.io/npm/l/@stackline/client-errors.svg?style=flat-square)](https://github.com/alexandroit/client-errors)
[![GitHub repository](https://img.shields.io/badge/GitHub-alexandroit%2Fclient-errors-181717?style=flat-square&logo=github)](https://github.com/alexandroit/client-errors)
[![Docs](https://img.shields.io/badge/docs-alexandro.net-0f766e?style=flat-square)](https://alexandro.net/docs/vanilla/client-errors/)
[![Reddit community](https://img.shields.io/badge/community-r%2FStackline-ff4500?style=flat-square&logo=reddit&logoColor=white)](https://www.reddit.com/r/Stackline/)

**[Documentation](https://alexandro.net/docs/vanilla/client-errors/)** | **[npm](https://www.npmjs.com/package/@stackline/client-errors)** | **[Issues](https://github.com/alexandroit/client-errors/issues)** | **[Repository](https://github.com/alexandroit/client-errors)**

**Current package version:** `1.0.3`

---

## Why this package?

`@stackline/client-errors` is maintained as part of the Stackline package collection.

## Compatibility

| Item | Value |
| :--- | :--- |
| Package | `@stackline/client-errors@1.0.3` |
| API target | `See the package-specific API reference` |
| Supported Node.js | `See supported framework requirements` |
| License | `MIT` |
| Module type | `module` |
| Main entry | `./dist/index.cjs` |
| Module entry | `./dist/index.js` |
| Types | `./dist/index.d.ts` |
| Runtime dependencies | `none` |

## Installation

```bash
npm install @stackline/client-errors
```

## Usage and API reference

> Browser error reporting SDK for sending normalized client-side errors to your own endpoint.


**[Documentation & Playground](https://alexandro.net/docs/vanilla/client-errors/)** | **[npm](https://www.npmjs.com/package/@stackline/client-errors)** | **[GitHub Download](https://github.com/alexandroit/client-errors/tree/main/downloads)** | **[Issues](https://github.com/alexandroit/client-errors/issues)** | **[Repository](https://github.com/alexandroit/client-errors)**

**Latest version:** `1.0.2`

---

## Why this library?

`@stackline/client-errors` is built for applications that need a small browser SDK for error capture without depending on a hosted service.

- it runs in standard browser environments
- it captures client-side runtime errors and useful context
- it normalizes events into one stable JSON payload
- it sends that payload to any endpoint you control
- it stays fail-silent and non-blocking so the host app keeps working even when SDK steps fail

This package is focused on the browser SDK layer. It does not include a hosted backend, dashboard, or replay service.

Version `1.0.2` preserves the complete runtime API, CommonJS type resolution, and declaration compatibility with TypeScript 3.9 while updating package documentation and GitHub release tooling.

## Features

| Feature | Supported |
| :--- | :---: |
| TypeScript-first browser SDK | ✅ |
| Framework-agnostic runtime | ✅ |
| ESM + CJS + bundled types | ✅ |
| Relative endpoint URLs | ✅ |
| Absolute endpoint URLs | ✅ |
| Async endpoint resolution | ✅ |
| Pure POST with no authentication | ✅ |
| Bearer token auth | ✅ |
| Custom static headers | ✅ |
| Dynamic headers via callback | ✅ |
| Credentials mode | ✅ |
| Window error capture | ✅ |
| Unhandled promise rejection capture | ✅ |
| Optional console.error / console.warn capture | ✅ |
| Optional resource load error capture | ✅ |
| Breadcrumbs for clicks, navigation, and manual events | ✅ |
| Optional sanitized DOM snippet capture | ✅ |
| Optional source-context lines for same-origin scripts | ✅ |
| Queue-based processing | ✅ |
| Rate limiting and dedupe | ✅ |
| Sanitization and redaction | ✅ |
| Optional screenshot path | ✅ |
| Documentation site with live playground | ✅ |

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Direct Download](#direct-download)
4. [Pure POST With No Authentication](#pure-post-with-no-authentication)
5. [Bearer Token Example](#bearer-token-example)
6. [Custom Headers Example](#custom-headers-example)
7. [Dynamic Headers Example](#dynamic-headers-example)
8. [Screenshot Example](#screenshot-example)
9. [Debug Context Example](#debug-context-example)
10. [Sanitization Example](#sanitization-example)
11. [Manual Capture Example](#manual-capture-example)
12. [Relative Endpoints](#relative-endpoints)
13. [API Reference](#api-reference)
14. [Payload Shape](#payload-shape)
15. [Privacy Notes](#privacy-notes)
16. [Performance Notes](#performance-notes)
17. [Limitations](#limitations)
18. [Run Locally](#run-locally)
19. [Security](#security)
20. [Community and Links](#community-and-links)
21. [License](#license)

## Installation

```bash
npm install @stackline/client-errors
```

## Quick Start

The main quick start uses a relative endpoint path:

```ts
import { initClientErrors } from "@stackline/client-errors";

initClientErrors({
  endpoint: "api/frontend-errors"
});
```

## Direct Download

If you do not install packages from npm, download the compiled browser bundle from the repository:

- [GitHub downloads folder](https://github.com/alexandroit/client-errors/tree/main/downloads)

The generated archive includes a browser-ready file named `client-errors.browser.js` that exposes `window.StacklineClientErrors`.

```html
<script src="./client-errors.browser.js"></script>
<script>
  StacklineClientErrors.initClientErrors({
    endpoint: "api/frontend-errors"
  });
</script>
```

## Pure POST With No Authentication

Use a normal POST request when no authentication is required:

```ts
import { initClientErrors } from "@stackline/client-errors";

initClientErrors({
  endpoint: "api/frontend-errors",
  appName: "billing-ui",
  environment: "production",
  release: "1.2.0"
});
```

## Bearer Token Example

```ts
initClientErrors({
  endpoint: "api/frontend-errors",
  auth: {
    type: "bearer",
    token: "public-ingest-token"
  }
});
```

## Custom Headers Example

```ts
initClientErrors({
  endpoint: "api/frontend-errors",
  auth: {
    type: "custom",
    headers: {
      "X-Ingest-Key": "demo-public-key"
    }
  }
});
```

## Dynamic Headers Example

```ts
initClientErrors({
  endpoint: "api/frontend-errors",
  headers: {
    "X-App-Client": "web"
  },
  getHeaders: async () => ({
    "X-Session": window.sessionStorage.getItem("session-id") ?? "anonymous"
  }),
  credentials: "include"
});
```

## Screenshot Example

Screenshot capture is optional and best-effort by design:

```ts
initClientErrors({
  endpoint: "api/frontend-errors",
  screenshot: {
    enabled: true,
    format: "image/jpeg",
    quality: 0.82,
    maxWidth: 1440,
    maxHeight: 1200
  }
});
```

You can also provide a custom screenshot provider if you want tighter control:

```ts
initClientErrors({
  endpoint: "api/frontend-errors",
  screenshot: {
    enabled: true,
    provider: async ({ format }) => {
      return format === "image/png" ? "data:image/png;base64,..." : "data:image/jpeg;base64,...";
    }
  }
});
```

## Debug Context Example

Attach a sanitized DOM snippet and source lines around the failing location:

```ts
initClientErrors({
  endpoint: "api/frontend-errors",
  dom: {
    enabled: true
  },
  sourceContext: {
    enabled: true,
    contextLines: 2
  }
});
```

`dom.enabled` captures a small sanitized HTML snippet near the failing element. `sourceContext.enabled` adds nearby source lines for same-origin scripts when a file, line, and column are available.

## Sanitization Example

```ts
initClientErrors({
  endpoint: "api/frontend-errors",
  sanitize: {
    enabled: true,
    redactKeys: ["password", "token", "authorization", "cookie"],
    redactHeaders: ["authorization", "cookie"],
    redactQueryParams: ["token", "session"],
    redactBodyPaths: ["auth.token", "user.password"],
    stripInputValues: {
      password: true,
      email: true,
      textarea: false
    },
    maskSelectors: [".masked-card-number"],
    removeSelectors: ["[data-private='true']"],
    maxStringLength: 1000,
    maxStackLength: 8000,
    replacementText: "[Redacted]"
  }
});
```

## Manual Capture Example

```ts
import {
  addBreadcrumb,
  captureException,
  captureMessage,
  flush,
  initClientErrors,
  setCustomContext,
  setUserContext
} from "@stackline/client-errors";

initClientErrors({
  endpoint: "api/frontend-errors",
  appName: "billing-ui",
  environment: "production"
});

setUserContext({
  id: "u_42",
  email: "team@example.com"
});

setCustomContext({
  tenantId: "tenant-acme"
});

addBreadcrumb({
  type: "checkout.step",
  value: "confirm-payment"
});

await captureException(new Error("Checkout failed"), {
  custom: {
    paymentMethod: "card"
  }
});

await captureMessage("A recoverable warning", "warn");
await flush();
```

## Relative Endpoints

```ts
initClientErrors({
  endpoint: "api/frontend-errors"
});
```

The SDK resolves relative endpoints using normal browser URL resolution rules. Absolute URLs are still supported when you need to send reports to another origin.

## API Reference

The public API is intentionally small:

```ts
import {
  addBreadcrumb,
  captureException,
  captureMessage,
  destroy,
  flush,
  initClientErrors,
  setCustomContext,
  setUserContext
} from "@stackline/client-errors";
```

### `initClientErrors(config)`

Creates a client, installs configured listeners, and makes it the active singleton used by the helper functions.

### `captureException(error, extra?)`

Queues an exception-like value for normalization and delivery.

### `captureMessage(message, level?, extra?)`

Queues a message-level event without requiring an `Error` object.

### `addBreadcrumb(breadcrumb)`

Adds a manual breadcrumb to the recent breadcrumb buffer.

### `setUserContext(userContext)`

Sets user context that will be merged into later payloads.

### `setCustomContext(customContext)`

Sets custom application context that will be merged into later payloads.

### `flush()`

Waits for the internal queue to drain.

### `destroy()`

Removes listeners, clears the active singleton, and stops future capture.

## Payload Shape

The SDK sends a normalized JSON payload shaped like this:

```ts
{
  schemaVersion: "1.0",
  eventId: "evt_...",
  timestamp: "2026-04-07T00:00:00.000Z",
  app: {
    name: "billing-ui",
    environment: "production",
    release: "1.2.0"
  },
  page: {
    url: "https://app.example.com/checkout",
    path: "/checkout",
    query: "?step=confirm",
    referrer: "https://app.example.com/cart",
    title: "Checkout"
  },
  browser: {
    userAgent: "...",
    language: "en-US",
    viewport: { width: 1440, height: 900 },
    screen: { width: 1440, height: 900 }
  },
  error: {
    type: "exception",
    name: "Error",
    message: "Checkout failed",
    stack: "...",
    dom: {
      target: "button#submit-order",
      activeElement: "button#submit-order",
      snippet: "<form id=\"checkout-form\">...</form>"
    },
    sourceContext: {
      fileName: "https://app.example.com/assets/main.js",
      line: 128,
      column: 14,
      lines: [
        { number: 126, content: "function priceOrder() {" },
        { number: 127, content: "  const divider = 0;" },
        { number: 128, content: "  return subtotal / divider;", highlight: true },
        { number: 129, content: "}" }
      ]
    }
  },
  console: [],
  breadcrumbs: [],
  network: [],
  screenshot: {
    format: "image/jpeg",
    dataUrl: "data:image/jpeg;base64,..."
  },
  user: {},
  custom: {}
}
```

## Privacy Notes

- sanitization is enabled by default
- common sensitive keys such as `password`, `token`, `authorization`, and `cookie` are redacted by default
- screenshot capture is optional and best-effort
- DOM snippets and source-context lines are optional and should be enabled deliberately
- DOM masking and element removal are configurable through selectors

You remain responsible for deciding what is acceptable to collect and send in your environment.

## Performance Notes

- event processing is queued instead of running fully inside browser error listeners
- transport uses `fetch` with timeout support
- the SDK is fail-silent by design, so dropped events are preferred over interfering with the host app
- console capture is off by default to avoid unnecessary noise and wrapping overhead
- source-context lines are only fetched for same-origin scripts and only when you enable that option

## Limitations

- this package does not provide a hosted backend, dashboard, or replay platform
- screenshot capture is browser-limited and can fail when DOM/CSS/CORS constraints block it
- resource load error capture can be noisy, so it is configurable
- the package focuses on browser runtime reporting, not analytics or session replay

## Run Locally

```bash
npm install
npm run build:all
npm run dev:docs
```

Checks:

```bash
npm run typecheck
npm test
```

Minimal browser example:

- [examples/basic/index.html](https://github.com/alexandroit/client-errors/blob/main/examples/basic/index.html)

## Security

Report vulnerabilities privately by following [SECURITY.md](SECURITY.md). Do
not disclose exploit details in a public issue.

## Community and Links

- [Stackline website](https://alexandro.net/)
- [GitHub projects](https://github.com/alexandroit)
- [npm packages](https://www.npmjs.com/~alex360qc)
- [Reddit community — r/Stackline](https://www.reddit.com/r/Stackline/)
- [Maintainer LinkedIn](https://www.linkedin.com/in/aleinfo/)

Use the repository's issue tracker for reproducible bugs and feature requests.
Join r/Stackline to share examples, ask usage questions, and discuss releases.

## License

MIT

## Credits and original authors

- Alexandro Paixao Marques.
- Copyright (c) 2026 Alexandro Marques.
- Stackline maintenance: [Alexandro Paixao Marques](https://www.linkedin.com/in/aleinfo/) and [Stackline contributors](https://github.com/alexandroit).

Original copyright, license notices and contributor acknowledgements remain part of this distribution. Stackline maintenance does not replace authorship of the original work.

## Community and Links

- [Stackline website](https://alexandro.net/)
- [GitHub projects](https://github.com/alexandroit)
- [npm packages](https://www.npmjs.com/~alex360qc)
- [Reddit community — r/Stackline](https://www.reddit.com/r/Stackline/)
- [Maintainer LinkedIn](https://www.linkedin.com/in/aleinfo/)

Use this repository's issue tracker for reproducible bugs and feature requests. Join r/Stackline for examples, usage questions and release discussions.
