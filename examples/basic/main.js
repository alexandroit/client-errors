import { captureException, flush, initClientErrors } from "../../dist/index.js";

const output = document.querySelector("#output");

initClientErrors({
  endpoint: "api/frontend-errors",
  appName: "basic-example",
  environment: "development",
  onSuccess: async () => {
    const response = await fetch("api/frontend-errors/logs");
    const result = await response.json();
    const latest = result.items?.[result.items.length - 1]?.payload;
    output.textContent = latest ? JSON.stringify(latest, null, 2) : "No request sent yet.";
  }
});

document.querySelector("#trigger")?.addEventListener("click", async () => {
  await captureException(new Error("Basic example failure"));
  await flush();
});
