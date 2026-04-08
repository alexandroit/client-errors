import { pages } from "./content/pages";
import { mountPlayground } from "./components/playground";

const app = document.querySelector<HTMLElement>("#app");

if (!app) {
  throw new TypeError("Docs app root was not found.");
}

const pageMarkup = pages
  .map(
    (page) => `
      <section id="${page.id}" class="panel">
        <div class="page__head">
          <span class="eyebrow">${page.eyebrow}</span>
          <h3>${page.title}</h3>
          <p>${page.description}</p>
        </div>
        <div class="page__body">${page.body}</div>
      </section>
    `
  )
  .join("");

const navMarkup = [
  `<a href="#playground">Live Playground</a>`,
  ...pages.map((page) => `<a href="#${page.id}">${page.title}</a>`)
].join("");

app.innerHTML = `
  <div class="layout">
    <aside class="sidebar">
      <a class="brand" href="#playground">
        <span class="eyebrow">ReviveJS</span>
        <h1>@revivejs/client-errors</h1>
        <p>Browser error reporting SDK for sending normalized client-side errors to your own endpoint.</p>
      </a>
      <nav class="nav">
        ${navMarkup}
      </nav>
    </aside>
    <main class="content">
      <div id="playground"></div>
      <section class="hero">
        <span class="eyebrow">Vanilla TypeScript SDK</span>
        <h2>Capture frontend errors and send them to your backend.</h2>
        <p><strong>@revivejs/client-errors</strong> listens for browser runtime failures, normalizes the event into a predictable payload, applies sanitization rules, and sends the result with a POST request.</p>
        <div class="hero__meta">
          <span>Absolute and relative endpoints</span>
          <span>Pure POST or authenticated requests</span>
          <span>Queue-based fail-silent processing</span>
          <span>Optional screenshots</span>
        </div>
      </section>
      ${pageMarkup}
    </main>
  </div>
`;

const playgroundRoot = document.querySelector<HTMLElement>("#playground");

if (playgroundRoot) {
  mountPlayground(playgroundRoot);
}
