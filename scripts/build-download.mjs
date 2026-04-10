import esbuild from "esbuild";
import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const packageJsonPath = path.join(rootDir, "package.json");
const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
const version = packageJson.version;
const downloadRootDir = path.join(rootDir, "downloads");
const bundleDirName = `stackline-client-errors-${version}`;
const bundleDir = path.join(downloadRootDir, bundleDirName);
const zipPath = path.join(downloadRootDir, `${bundleDirName}.zip`);
const browserBundlePath = path.join(bundleDir, "client-errors.browser.js");
const installGuidePath = path.join(bundleDir, "INSTALLATION.txt");
const readmePath = path.join(downloadRootDir, "README.md");

const installGuide = `@stackline/client-errors ${version}

Browser bundle download
=======================

This folder is intended for applications that do not install packages from npm.

Files
-----
- client-errors.browser.js
- LICENSE
- README.md

Script tag usage
----------------
<script src="./client-errors.browser.js"></script>
<script>
  StacklineClientErrors.initClientErrors({
    endpoint: "api/frontend-errors"
  });
</script>

Global name
-----------
window.StacklineClientErrors

Main exports
------------
- initClientErrors
- createClientErrors
- captureException
- captureMessage
- addBreadcrumb
- setUserContext
- setCustomContext
- flush
- destroy
`;

const downloadReadme = `# GitHub Downloads

This directory contains compiled browser-ready downloads for developers who do not install \`@stackline/client-errors\` from npm.

Current version:

- [${bundleDirName}.zip](./${bundleDirName}.zip)

Inside the archive:

- \`client-errors.browser.js\`
- \`README.md\`
- \`LICENSE\`
- \`INSTALLATION.txt\`

Script tag example:

\`\`\`html
<script src="./client-errors.browser.js"></script>
<script>
  StacklineClientErrors.initClientErrors({
    endpoint: "api/frontend-errors"
  });
</script>
\`\`\`
`;

await fs.rm(downloadRootDir, { recursive: true, force: true });
await fs.mkdir(bundleDir, { recursive: true });

await esbuild.build({
  entryPoints: [path.join(rootDir, "src/index.ts")],
  bundle: true,
  minify: true,
  format: "iife",
  target: "es2019",
  platform: "browser",
  globalName: "StacklineClientErrors",
  outfile: browserBundlePath
});

await fs.copyFile(path.join(rootDir, "README.md"), path.join(bundleDir, "README.md"));
await fs.copyFile(path.join(rootDir, "LICENSE"), path.join(bundleDir, "LICENSE"));
await fs.writeFile(installGuidePath, installGuide, "utf8");
await fs.writeFile(readmePath, downloadReadme, "utf8");

await execFileAsync("zip", ["-rq", zipPath, bundleDirName], {
  cwd: downloadRootDir
});

console.log(`Built GitHub download bundle into ${path.relative(rootDir, downloadRootDir)}/`);
