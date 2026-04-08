import test from "node:test";
import assert from "node:assert/strict";
import { resolveConfig } from "../src/core/config";
import { createClientErrors } from "../src/core/client";
import { sanitizePayload } from "../src/sanitize/core";
import { sendPayload } from "../src/transport/fetch";
import { resolveEndpoint } from "../src/transport/resolve-endpoint";
import type { ClientErrorsPayload } from "../src/types";

const installBrowserStubs = () => {
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;
  const originalNavigator = globalThis.navigator;
  const originalFetch = globalThis.fetch;

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      location: {
        href: "https://app.example.com/dashboard?token=secret",
        pathname: "/dashboard",
        search: "?token=secret"
      },
      innerWidth: 1280,
      innerHeight: 720,
      screen: {
        width: 1440,
        height: 900
      },
      addEventListener: () => {},
      removeEventListener: () => {},
      history: {
        pushState: () => {},
        replaceState: () => {}
      }
    }
  });

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      referrer: "https://referrer.example.com",
      title: "Client errors test page",
      addEventListener: () => {},
      removeEventListener: () => {}
    }
  });

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      userAgent: "node-test",
      language: "en-US"
    }
  });

  return () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: originalDocument
    });
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: originalNavigator
    });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: originalFetch
    });
  };
};

test("resolves absolute and relative endpoints safely", async () => {
  const restore = installBrowserStubs();

  try {
    assert.equal(
      await resolveEndpoint("https://api.example.com/frontend-errors"),
      "https://api.example.com/frontend-errors"
    );
    assert.equal(
      await resolveEndpoint("/api/frontend-errors"),
      "https://app.example.com/api/frontend-errors"
    );
    assert.equal(
      await resolveEndpoint("api/frontend-errors"),
      "https://app.example.com/api/frontend-errors"
    );
  } finally {
    restore();
  }
});

test("sanitizes payload values, stacks, and query parameters", () => {
  const payload: ClientErrorsPayload = {
    schemaVersion: "1.0",
    eventId: "evt_1",
    timestamp: "2026-01-01T00:00:00.000Z",
    page: {
      url: "https://app.example.com/dashboard?token=secret&tab=errors",
      query: "?token=secret&tab=errors"
    },
    error: {
      type: "exception",
      message: "Something failed",
      stack: "x".repeat(9000)
    },
    breadcrumbs: [
      {
        type: "manual",
        value: "y".repeat(500),
        timestamp: "2026-01-01T00:00:00.000Z"
      }
    ],
    custom: {
      password: "secret",
      nested: {
        token: "very-secret"
      }
    }
  };

  const sanitized = sanitizePayload(payload, {
    enabled: true,
    redactKeys: ["password", "token"],
    redactHeaders: [],
    redactQueryParams: ["token"],
    redactBodyPaths: [],
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
  });

  assert.match(sanitized.page.url, /%5BRedacted%5D/);
  assert.match(sanitized.page.query ?? "", /%5BRedacted%5D/);
  assert.equal(sanitized.custom?.password, "[Redacted]");
  assert.equal((sanitized.custom?.nested as { token: string }).token, "[Redacted]");
  assert.equal(sanitized.breadcrumbs?.[0]?.value.length, 241);
  assert.equal(sanitized.error.stack?.length, 8001);
});

test("manual capture posts a normalized payload to the configured endpoint", async () => {
  const restore = installBrowserStubs();
  let capturedBody = "";

  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: async (_input: RequestInfo | URL, init?: RequestInit) => {
      capturedBody = String(init?.body ?? "");
      return new Response(null, {
        status: 202,
        statusText: "Accepted"
      });
    }
  });

  try {
    const client = createClientErrors({
      endpoint: "https://api.example.com/frontend-errors",
      appName: "billing-ui",
      environment: "production",
      release: "1.2.0"
    });

    await client.captureException(new Error("Checkout failed"), {
      custom: {
        feature: "checkout"
      }
    });
    await client.flush();
    client.destroy();

    const payload = JSON.parse(capturedBody) as ClientErrorsPayload;
    assert.equal(payload.app?.name, "billing-ui");
    assert.equal(payload.error.message, "Checkout failed");
    assert.equal(payload.page.path, "/dashboard");
    assert.equal(payload.custom?.feature, "checkout");
  } finally {
    restore();
  }
});

test("dedupes identical payloads inside the configured window", async () => {
  const restore = installBrowserStubs();
  let requestCount = 0;

  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: async () => {
      requestCount += 1;
      return new Response(null, {
        status: 202,
        statusText: "Accepted"
      });
    }
  });

  try {
    const client = createClientErrors({
      endpoint: "https://api.example.com/frontend-errors",
      dedupeWindowMs: 10_000
    });

    await client.captureMessage("Same message");
    await client.captureMessage("Same message");
    await client.flush();
    client.destroy();

    assert.equal(requestCount, 1);
  } finally {
    restore();
  }
});

test("disables keepalive for payloads that include screenshots", async () => {
  const restore = installBrowserStubs();
  let keepaliveValue: boolean | undefined;

  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: async (_input: RequestInfo | URL, init?: RequestInit) => {
      keepaliveValue = init?.keepalive;
      return new Response(null, {
        status: 202,
        statusText: "Accepted"
      });
    }
  });

  try {
    const payload: ClientErrorsPayload = {
      schemaVersion: "1.0",
      eventId: "evt_screenshot",
      timestamp: "2026-01-01T00:00:00.000Z",
      page: {
        url: "https://app.example.com/dashboard"
      },
      error: {
        type: "exception",
        message: "Screenshot payload"
      },
      screenshot: {
        format: "image/png",
        dataUrl: `data:image/png;base64,${"a".repeat(90_000)}`
      }
    };

    await sendPayload(
      resolveConfig({
        endpoint: "https://api.example.com/frontend-errors"
      }),
      payload
    );

    assert.equal(keepaliveValue, false);
  } finally {
    restore();
  }
});
