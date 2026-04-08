import test from "node:test";
import assert from "node:assert/strict";
import { resolveConfig } from "../src/core/config";
import { createClientErrors } from "../src/core/client";
import { captureDomContext } from "../src/normalize/dom-context";
import { captureSourceContext } from "../src/normalize/source-context";
import { sanitizePayload } from "../src/sanitize/core";
import { sendPayload } from "../src/transport/fetch";
import { resolveEndpoint } from "../src/transport/resolve-endpoint";
import type { ClientErrorsPayload } from "../src/types";
import type { ClientErrorsState } from "../src/core/state";

class FakeElement {
  tagName: string;
  id: string;
  className: string;
  textContent: string;
  outerHTML: string;
  private readonly container: FakeElement | null;

  constructor(options: {
    tagName?: string;
    id?: string;
    className?: string;
    textContent?: string;
    outerHTML?: string;
    container?: FakeElement | null;
  } = {}) {
    this.tagName = (options.tagName ?? "div").toUpperCase();
    this.id = options.id ?? "";
    this.className = options.className ?? "";
    this.textContent = options.textContent ?? "";
    this.outerHTML = options.outerHTML ?? "<div></div>";
    this.container = options.container ?? null;
  }

  closest(selector: string): FakeElement | null {
    if (selector === "form" && this.container?.tagName === "FORM") {
      return this.container;
    }

    if (selector.includes("form") && this.container?.tagName === "FORM") {
      return this.container;
    }

    return null;
  }

  cloneNode(): FakeElement {
    return new FakeElement({
      tagName: this.tagName,
      id: this.id,
      className: this.className,
      textContent: this.textContent,
      outerHTML: this.outerHTML
    });
  }

  querySelectorAll(): Array<{ remove?: () => void; textContent?: string }> {
    return [];
  }

  addEventListener(): void {}

  removeEventListener(): void {}

  dispatchEvent(): boolean {
    return true;
  }
}

const installBrowserStubs = () => {
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;
  const originalNavigator = globalThis.navigator;
  const originalFetch = globalThis.fetch;
  const originalElement = (globalThis as { Element?: unknown }).Element;

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      location: {
        href: "https://app.example.com/dashboard?token=secret",
        origin: "https://app.example.com",
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
      activeElement: null,
      body: null,
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

  Object.defineProperty(globalThis, "Element", {
    configurable: true,
    value: FakeElement
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
    Object.defineProperty(globalThis, "Element", {
      configurable: true,
      value: originalElement
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

test("captures a sanitized DOM snippet for the active element container", () => {
  const restore = installBrowserStubs();

  try {
    const form = new FakeElement({
      tagName: "form",
      id: "checkout-form",
      outerHTML:
        '<form id="checkout-form"><button id="submit-order" class="primary">Pay now</button></form>'
    });
    const button = new FakeElement({
      tagName: "button",
      id: "submit-order",
      className: "primary",
      textContent: "Pay now",
      outerHTML: '<button id="submit-order" class="primary">Pay now</button>',
      container: form
    });

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        referrer: "https://referrer.example.com",
        title: "Client errors test page",
        activeElement: button,
        body: form,
        addEventListener: () => {},
        removeEventListener: () => {}
      }
    });

    const domContext = captureDomContext(button, "", {
      enabled: true,
      redactKeys: [],
      redactHeaders: [],
      redactQueryParams: [],
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

    assert.equal(domContext?.target, 'button#submit-order.primary "Pay now"');
    assert.match(domContext?.snippet ?? "", /checkout-form/);
  } finally {
    restore();
  }
});

test("captures source lines for same-origin scripts when enabled", async () => {
  const restore = installBrowserStubs();

  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/assets/main.js")) {
        return new Response(
          ['const subtotal = 128.45;', "const divider = 0;", "return subtotal / divider;"].join("\n"),
          {
            status: 200,
            statusText: "OK"
          }
        );
      }

      return new Response(null, {
        status: 202,
        statusText: "Accepted"
      });
    }
  });

  try {
    const state = {
      config: resolveConfig({
        endpoint: "https://api.example.com/frontend-errors",
        sourceContext: {
          enabled: true,
          contextLines: 1
        }
      }),
      sourceFileCache: new Map<string, Promise<string | null>>()
    } as ClientErrorsState;

    const sourceContext = await captureSourceContext(
      state,
      "https://app.example.com/assets/main.js",
      3,
      18
    );

    assert.equal(sourceContext?.line, 3);
    assert.equal(sourceContext?.lines?.length, 2);
    assert.equal(sourceContext?.lines?.[1]?.highlight, true);
    assert.match(sourceContext?.lines?.[1]?.content ?? "", /divider/);
  } finally {
    restore();
  }
});
