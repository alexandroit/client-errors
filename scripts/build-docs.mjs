import esbuild from "esbuild";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const docsSrcDir = path.join(rootDir, "docs-src");
const docsDir = path.join(rootDir, "docs");
const blankHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Blank</title>
    <style>
      html, body {
        margin: 0;
        min-height: 100%;
        background: #ffffff;
      }
    </style>
  </head>
  <body></body>
</html>
`;

const writeBlankIndex = async (relativeDir) => {
  const targetDir = path.join(docsDir, relativeDir);
  await fs.mkdir(targetDir, { recursive: true });
  await fs.writeFile(path.join(targetDir, "index.html"), blankHtml, "utf8");
};

await fs.rm(docsDir, { recursive: true, force: true });
await fs.mkdir(docsDir, { recursive: true });

await esbuild.build({
  entryPoints: [path.join(docsSrcDir, "main.ts")],
  bundle: true,
  format: "esm",
  minify: true,
  sourcemap: false,
  target: "es2019",
  outfile: path.join(docsDir, "main.js")
});

await fs.copyFile(path.join(docsSrcDir, "index.html"), path.join(docsDir, "index.html"));
await fs.copyFile(path.join(docsSrcDir, "favicon.svg"), path.join(docsDir, "favicon.svg"));
await fs.copyFile(path.join(docsSrcDir, "styles", "site.css"), path.join(docsDir, "site.css"));
await writeBlankIndex(path.join("api", "frontend-errors"));
await writeBlankIndex(path.join("api", "frontend-errors", "logs"));

console.log("Built docs into docs/.");
