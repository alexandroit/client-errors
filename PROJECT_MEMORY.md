# @stackline/client-errors project memory

Last updated: 2026-05-22

## Current release

- Package: `@stackline/client-errors`
- Stable version: `1.0.0`
- Public npm registry: `https://registry.npmjs.org/`
- Local Verdaccio registry: `http://192.168.3.52:4873/`
- Public docs: `https://alexandro.net/docs/vanilla/client-errors/`
- Repository: `https://github.com/alexandroit/client-errors`

## What was done for 1.0.0

- Set `package.json` and `package-lock.json` to `1.0.0`.
- Updated `README.md` and the docs playground release snippets to `1.0.0`.
- Rebuilt generated package output, static docs, and the direct download bundle.
- Published `@stackline/client-errors@1.0.0` to public npm.
- Published `@stackline/client-errors@1.0.0` to the local Verdaccio registry.
- Published static docs to the production docs root on `codex-server`:
  - source staging: `/storage/data/build/alexandro.net-docs`
  - production target: `/var/www/html/alexandro.net_docs`
- Updated the `alexandro.net` seed and live database so `/projects/client-errors/` shows `1.0.0`.

## Verification commands

Run these from `/storage/data/github/revivejs/client-errors/client-errors`:

```bash
npm run check
npm view @stackline/client-errors version --registry https://registry.npmjs.org/
npm view @stackline/client-errors version --registry http://192.168.3.52:4873/
```

Expected version:

```text
1.0.0
```

## Notes for future releases

- Keep docs source changes in `docs-src`, then rebuild generated `docs`.
- Re-run the shared docs staging script before publishing docs:

```bash
node /storage/data/github/revivejs/tools/stage-alexandro-docs.mjs
```

- Sync staged docs to the production server with sudo rsync:

```bash
rsync -az --delete --rsync-path='sudo rsync' /storage/data/build/alexandro.net-docs/ codex-server:/var/www/html/alexandro.net_docs/
```

- Publish to local Verdaccio from localhost because the saved auth token is host-specific:

```bash
npm publish --registry http://127.0.0.1:4873/ --access public
```
