import {
  addBreadcrumb,
  captureException,
  captureMessage,
  destroy,
  flush,
  initClientErrors
} from "../../src/index";
import type { ClientErrorsPayload } from "../../src/types";

const getCodeSnippet = (endpoint: string, authMode: string, captureConsoleErrors: boolean): string => {
  const authSnippet =
    authMode === "bearer"
      ? `,\n  auth: {\n    type: "bearer",\n    token: "public-ingest-token"\n  }`
      : authMode === "custom"
        ? `,\n  auth: {\n    type: "custom",\n    headers: {\n      "X-Ingest-Key": "demo-public-key"\n    }\n  }`
        : "";

  return `import { initClientErrors } from "@stackline/client-errors";

initClientErrors({
  endpoint: "${endpoint}",
  appName: "docs-playground",
  environment: "development",
  release: "0.1.1",
  captureWindowErrors: true,
  captureUnhandledRejections: true,
  captureConsoleErrors: ${captureConsoleErrors},
  dom: {
    enabled: true
  },
  sourceContext: {
    enabled: true,
    contextLines: 2
  },
  screenshot: {
    enabled: true,
    format: "image/png",
    includeInPayload: true
  }${authSnippet}
});`;
};

const waitForPaint = async (): Promise<void> =>
  new Promise((resolve) => {
    globalThis.requestAnimationFrame(() => {
      globalThis.requestAnimationFrame(() => resolve());
    });
  });

const calculateCheckoutTotal = (): number => {
  const subtotal = 128.45;
  const promotionDivider = 0;

  if (promotionDivider === 0) {
    throw new Error("Division by zero in checkout pricing engine");
  }

  return subtotal / promotionDivider;
};

const renderPayload = (target: HTMLElement, payload: ClientErrorsPayload | null): void => {
  if (!payload) {
    target.textContent = "No payload received yet.";
    return;
  }

  const previewPayload: ClientErrorsPayload = payload.screenshot?.dataUrl
    ? {
        ...payload,
        screenshot: {
          ...payload.screenshot,
          dataUrl: `${payload.screenshot.dataUrl.slice(0, 180)}... [truncated in docs preview]`
        }
      }
    : payload;

  target.textContent = JSON.stringify(previewPayload, null, 2);
};

const renderScreenshot = (
  imageTarget: HTMLImageElement,
  emptyTarget: HTMLElement,
  metaTarget: HTMLElement,
  payload: ClientErrorsPayload | null
): void => {
  const screenshot = payload?.screenshot?.dataUrl;

  if (!screenshot) {
    imageTarget.hidden = true;
    imageTarget.removeAttribute("src");
    emptyTarget.hidden = false;
    metaTarget.textContent = "The next captured event will render a full-screen screenshot of the page here.";
    return;
  }

  imageTarget.src = screenshot;
  imageTarget.alt = "Captured screenshot of the client-errors playground action";
  imageTarget.hidden = false;
  emptyTarget.hidden = true;
  metaTarget.textContent = `${payload?.screenshot?.format ?? "image/png"} attached to event ${payload?.eventId ?? "unknown"}`;
};

export const mountPlayground = (element: HTMLElement): void => {
  const originalConsoleError = console.error.bind(console);
  const isStaticDocsMode =
    typeof window !== "undefined" && window.location.hostname.endsWith("github.io");
  const simulatedPayloads: ClientErrorsPayload[] = [];

  element.innerHTML = `
    <section class="playground">
      <div class="playground__header">
        <div>
          <span class="eyebrow">Live playground</span>
          <h2>Trigger an error and inspect the report</h2>
          <p>This demo initializes the SDK, triggers a checkout calculation error, and shows the normalized payload together with the captured screenshot.</p>
        </div>
      </div>
      <div class="playground__grid">
        <div class="playground__panel">
          <label class="field">
            <span>Endpoint</span>
            <input id="playground-endpoint" type="text" value="api/frontend-errors" />
          </label>
          <label class="field">
            <span>Auth mode</span>
            <select id="playground-auth">
              <option value="none">No auth</option>
              <option value="bearer">Bearer token</option>
              <option value="custom">Custom headers</option>
            </select>
          </label>
          <label class="field field--inline">
            <input id="playground-console-errors" type="checkbox" />
            <span>Capture console.error</span>
          </label>
          <div class="actions">
            <button id="playground-init" class="button" type="button">Initialize SDK</button>
            <button id="playground-clear" class="button button--secondary" type="button">Clear server logs</button>
          </div>
          <div class="playground__tools">
            <span class="eyebrow eyebrow--muted">Extra triggers</span>
            <div class="actions">
              <button id="playground-capture-message" class="button button--secondary" type="button">Capture message</button>
              <button id="playground-trigger-console" class="button button--secondary" type="button">console.error</button>
            </div>
            <div class="actions">
              <button id="playground-trigger-rejection" class="button button--secondary" type="button">Unhandled rejection</button>
              <button id="playground-breadcrumb" class="button button--secondary" type="button">Add breadcrumb</button>
            </div>
          </div>
          <div class="snippet">
            <h3>Vanilla setup</h3>
            <pre><code id="playground-code"></code></pre>
          </div>
        </div>
        <div class="playground__preview">
          <div class="preview-card">
            <div class="status-pill" id="playground-status">SDK not initialized</div>
            <div class="status-meta" id="playground-count">Server events: 0</div>
            <p class="preview-copy">${isStaticDocsMode ? "On GitHub Pages this demo prepares the payload locally and skips the network request." : "Click the button to trigger a checkout error. The payload and screenshot will appear below."}</p>
          </div>
          <div class="demo-surface" id="playground-demo-surface" data-phase="ready">
            <div class="demo-surface__bar">
              <span class="demo-surface__phase" id="playground-demo-phase">Checkout ready</span>
              <span class="demo-surface__action" id="playground-demo-action">Waiting for a user action</span>
            </div>
            <div class="demo-surface__body">
              <div class="demo-surface__summary">
                <div class="demo-metric">
                  <span>Subtotal</span>
                  <strong>$128.45</strong>
                </div>
                <div class="demo-metric">
                  <span>Promotion divider</span>
                  <strong id="playground-demo-divider">0</strong>
                </div>
                <div class="demo-metric">
                  <span>Order total</span>
                  <strong id="playground-demo-total">Pending calculation</strong>
                </div>
              </div>
              <div class="demo-surface__notice" id="playground-demo-note">Click the button to simulate a checkout rule that divides by zero.</div>
              <div class="demo-surface__error" id="playground-demo-error" hidden></div>
            </div>
            <div class="demo-surface__footer">
              <span class="demo-chip" id="playground-demo-click">No click recorded yet</span>
              <div class="actions">
                <button id="playground-trigger-demo" class="button" type="button">Trigger checkout error</button>
                <button id="playground-reset-demo" class="button button--secondary" type="button">Reset surface</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="playground__row">
        <div class="preview-card preview-card--payload">
          <h3>Last received payload</h3>
          <p class="preview-copy">This is the normalized payload generated for the last captured event.</p>
          <pre><code id="playground-output">No payload received yet.</code></pre>
        </div>
      </div>
      <div class="playground__row">
        <div class="preview-card">
          <h3>Captured screenshot</h3>
          <p class="preview-copy" id="playground-screenshot-meta">The next captured event will render a full-screen screenshot of the page here.</p>
          <div class="screenshot-card">
            <div class="screenshot-empty" id="playground-screenshot-empty">No screenshot captured yet.</div>
            <img id="playground-screenshot-image" class="screenshot-image" hidden />
          </div>
        </div>
      </div>
    </section>
  `;

  const endpointInput = element.querySelector<HTMLInputElement>("#playground-endpoint");
  const authSelect = element.querySelector<HTMLSelectElement>("#playground-auth");
  const consoleErrorsInput = element.querySelector<HTMLInputElement>("#playground-console-errors");
  const codeTarget = element.querySelector<HTMLElement>("#playground-code");
  const outputTarget = element.querySelector<HTMLElement>("#playground-output");
  const statusTarget = element.querySelector<HTMLElement>("#playground-status");
  const countTarget = element.querySelector<HTMLElement>("#playground-count");
  const screenshotImage = element.querySelector<HTMLImageElement>("#playground-screenshot-image");
  const screenshotEmpty = element.querySelector<HTMLElement>("#playground-screenshot-empty");
  const screenshotMeta = element.querySelector<HTMLElement>("#playground-screenshot-meta");
  const demoSurface = element.querySelector<HTMLElement>("#playground-demo-surface");
  const demoPhase = element.querySelector<HTMLElement>("#playground-demo-phase");
  const demoAction = element.querySelector<HTMLElement>("#playground-demo-action");
  const demoNote = element.querySelector<HTMLElement>("#playground-demo-note");
  const demoError = element.querySelector<HTMLElement>("#playground-demo-error");
  const demoClick = element.querySelector<HTMLElement>("#playground-demo-click");
  const demoTotal = element.querySelector<HTMLElement>("#playground-demo-total");
  const demoDivider = element.querySelector<HTMLElement>("#playground-demo-divider");

  if (
    !endpointInput ||
    !authSelect ||
    !consoleErrorsInput ||
    !codeTarget ||
    !outputTarget ||
    !statusTarget ||
    !countTarget ||
    !screenshotImage ||
    !screenshotEmpty ||
    !screenshotMeta ||
    !demoSurface ||
    !demoPhase ||
    !demoAction ||
    !demoNote ||
    !demoError ||
    !demoClick ||
    !demoTotal ||
    !demoDivider
  ) {
    return;
  }

  const resetDemoSurface = (): void => {
    demoSurface.dataset.phase = "ready";
    demoPhase.textContent = "Checkout ready";
    demoAction.textContent = "Waiting for a user action";
    demoNote.textContent = "Click the button to simulate a checkout rule that divides by zero.";
    demoClick.textContent = "No click recorded yet";
    demoTotal.textContent = "Pending calculation";
    demoDivider.textContent = "0";
    demoError.hidden = true;
    demoError.textContent = "";
  };

  const updateSnippet = (): void => {
    codeTarget.textContent = getCodeSnippet(
      endpointInput.value,
      authSelect.value,
      consoleErrorsInput.checked
    );
  };

  const refreshLogs = async (): Promise<void> => {
    if (isStaticDocsMode) {
      const latest = simulatedPayloads[simulatedPayloads.length - 1] ?? null;

      countTarget.textContent = `Prepared events: ${simulatedPayloads.length}`;
      renderPayload(outputTarget, latest);
      renderScreenshot(screenshotImage, screenshotEmpty, screenshotMeta, latest);
      return;
    }

    try {
      const response = await fetch("api/frontend-errors/logs");
      const result = await response.json();
      const latest = (result.items?.[result.items.length - 1]?.payload ?? null) as ClientErrorsPayload | null;

      countTarget.textContent = `Server events: ${result.count ?? 0}`;
      renderPayload(outputTarget, latest);
      renderScreenshot(screenshotImage, screenshotEmpty, screenshotMeta, latest);
    } catch {
      countTarget.textContent = "Server events: unavailable";
      outputTarget.textContent = "Unable to read server logs.";
      renderScreenshot(screenshotImage, screenshotEmpty, screenshotMeta, null);
    }
  };

  const initializeSdk = async (): Promise<void> => {
    destroy();
    simulatedPayloads.splice(0, simulatedPayloads.length);

    const endpoint = endpointInput.value.trim();
    const authMode = authSelect.value;
    const captureConsoleErrors = consoleErrorsInput.checked;

    initClientErrors({
      endpoint,
      appName: "docs-playground",
      environment: "development",
      release: "0.1.1",
      captureWindowErrors: true,
      captureUnhandledRejections: true,
      captureConsoleErrors,
      dom: {
        enabled: true
      },
      sourceContext: {
        enabled: true,
        contextLines: 2
      },
      screenshot: {
        enabled: true,
        format: "image/png",
        includeInPayload: true,
        maxWidth: 1440,
        maxHeight: 1200
      },
      auth:
        authMode === "bearer"
          ? {
              type: "bearer",
              token: "public-ingest-token"
            }
          : authMode === "custom"
            ? {
                type: "custom",
                headers: {
                  "X-Ingest-Key": "demo-public-key"
                }
              }
            : {
                type: "none"
              },
      beforeSend: (payload) => {
        if (!isStaticDocsMode) {
          return payload;
        }

        simulatedPayloads.push(payload);
        statusTarget.textContent = "Payload prepared locally";
        void refreshLogs();
        return null;
      },
      onSuccess: () => {
        statusTarget.textContent = "Payload delivered";
        void refreshLogs();
      },
      onError: () => {
        statusTarget.textContent = "Transport or SDK step failed silently";
      }
    });

    statusTarget.textContent = "SDK initialized";
    updateSnippet();
    if (!isStaticDocsMode) {
      await fetch("api/frontend-errors/logs", { method: "DELETE" });
    }
    await refreshLogs();
  };

  element.querySelector<HTMLButtonElement>("#playground-init")?.addEventListener("click", () => {
    void initializeSdk();
  });
  element.querySelector<HTMLButtonElement>("#playground-clear")?.addEventListener("click", async () => {
    simulatedPayloads.splice(0, simulatedPayloads.length);
    if (!isStaticDocsMode) {
      await fetch("api/frontend-errors/logs", { method: "DELETE" });
    }
    renderPayload(outputTarget, null);
    renderScreenshot(screenshotImage, screenshotEmpty, screenshotMeta, null);
    countTarget.textContent = isStaticDocsMode ? "Prepared events: 0" : "Server events: 0";
    statusTarget.textContent = isStaticDocsMode ? "Prepared payloads cleared" : "Server logs cleared";
    resetDemoSurface();
  });
  element.querySelector<HTMLButtonElement>("#playground-capture-message")?.addEventListener("click", async () => {
    addBreadcrumb({ type: "manual", value: "captureMessage button clicked" });
    await captureMessage("Playground informational message", "warn", {
      custom: {
        channel: "docs-playground"
      }
    });
    await flush();
  });
  element.querySelector<HTMLButtonElement>("#playground-trigger-console")?.addEventListener("click", async () => {
    console.error("Playground console.error sample");
    await flush();
  });
  element.querySelector<HTMLButtonElement>("#playground-trigger-rejection")?.addEventListener("click", () => {
    Promise.reject(new Error("Playground unhandled rejection"));
  });
  element.querySelector<HTMLButtonElement>("#playground-breadcrumb")?.addEventListener("click", () => {
    addBreadcrumb({
      type: "manual",
      value: "Manual breadcrumb from playground"
    });
    statusTarget.textContent = "Breadcrumb added";
  });
  element.querySelector<HTMLButtonElement>("#playground-reset-demo")?.addEventListener("click", () => {
    resetDemoSurface();
    statusTarget.textContent = "Demo surface reset";
  });
  element.querySelector<HTMLButtonElement>("#playground-trigger-demo")?.addEventListener("click", async (event) => {
    addBreadcrumb({
      type: "manual",
      value: "Checkout CTA clicked in playground"
    });

    demoSurface.dataset.phase = "processing";
    demoPhase.textContent = "Repricing order";
    demoAction.textContent = "Checkout CTA clicked";
    demoNote.textContent = "The UI is recalculating the order total before the failure is reported.";
    demoClick.textContent = "Clicked: Trigger checkout error";
    demoTotal.textContent = "Recomputing...";
    demoError.hidden = true;
    demoError.textContent = "";
    statusTarget.textContent = "Simulating checkout failure";

    await waitForPaint();

    try {
      const total = calculateCheckoutTotal();

      demoTotal.textContent = `$${total.toFixed(2)}`;
      demoNote.textContent = "Calculation unexpectedly succeeded.";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown checkout runtime error";

      demoSurface.dataset.phase = "failed";
      demoPhase.textContent = "Checkout failed";
      demoAction.textContent = "Division error visible in the UI";
      demoNote.textContent =
        "This visible error state is rendered first so the screenshot shows the exact broken page state.";
      demoTotal.textContent = "Order total unavailable";
      demoError.hidden = false;
      demoError.textContent = message;
      statusTarget.textContent = "Division error captured, flushing queue";
      originalConsoleError("Playground checkout error:", error);

      await waitForPaint();

      await captureException(error, {
        source: "docs.checkout-demo",
        target: event.currentTarget,
        custom: {
          demo: "checkout-surface",
          action: "trigger-checkout-error",
          divider: 0,
          orderId: "demo-order-2048",
          surfaceState: "failed"
        }
      });
      await flush();
    }
  });

  endpointInput.addEventListener("input", updateSnippet);
  authSelect.addEventListener("change", updateSnippet);
  consoleErrorsInput.addEventListener("change", updateSnippet);

  updateSnippet();
  resetDemoSurface();
  void refreshLogs();
  void initializeSdk();
};
