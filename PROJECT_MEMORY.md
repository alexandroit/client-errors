# @stackline/client-errors project memory

Last updated: 2026-08-19

## Current release

- Package: `@stackline/client-errors`
- Stable version: `1.0.1`
- Public npm registry: `https://registry.npmjs.org/`
- Local Verdaccio registry: `http://192.168.3.52:4873/`
- Public docs: `https://alexandro.net/docs/vanilla/client-errors/`
- Repository: `https://github.com/alexandroit/client-errors`

## What was done for 1.0.1

- Kept runtime behavior byte-identical to `1.0.0`; the nine public exports are unchanged.
- Corrected ESM/CommonJS declaration routing with separate `index.d.ts` and `index.d.cts` files.
- Added an automated TypeScript 3.9 declaration-consumer check while retaining TypeScript 5.9 for development.
- Refreshed `esbuild`, `tsup`, `tsx`, and Node typings; `npm audit` reports zero known vulnerabilities.
- Added pinned GitHub Actions CI, `CHANGELOG.md`, reproducible package checks, and AI-readable `llms.txt` / `llms-full.txt` documentation.
- Published the same CI-built tarball to Verdaccio and public npm as `latest`.
- Created Git tags and GitHub releases for `v1.0.0` and `v1.0.1`.
- Deployed only `/var/www/html/alexandro.net_docs/vanilla/client-errors/` on `codex-server`.

## Release evidence

- Release commit: `f53c76830bc599609d83f9b90b3ca4326688ce1f`
- GitHub Actions run: `32312463878` (success)
- Artifact directory: `/storage/data/releases/stackline-client-errors/1.0.1-ci-32312463878`
- Tarball: `stackline-client-errors-1.0.1.tgz` (24,485 bytes)
- SHA-512: `a98dbace915111af7e5b71e51e1f175ae4aa566db1633fde7f04fc271e1a2860c8b2d7dc438ab5490713e9594b95925026ca15e838fbd99ce75bf3a631a13162`
- npm integrity: `sha512-qY26zpFREa9+W3HlHh8XWuSqVm2xYz/efwT8Jx4aKGDIstfcQ4q1SQcT6VlLlZJQJsoV6Dj72ZznW/OmMaExYg==`
- npm shasum: `c49cc6f5d6e8e3882566f80110f7cf42c7237b3d`
- Public npm and Verdaccio anonymous downloads matched the CI artifact byte for byte.
- Public consumer smoke tests passed for ESM and CommonJS with identical export sets and zero production vulnerabilities.
- Production documentation returned HTTP 200; local and remote hashes matched for HTML, JavaScript, CSS, and both AI-readable files.

## Verification commands

Run these from `/storage/data/github/revivejs/client-errors/client-errors`:

```bash
npm run check
npm view @stackline/client-errors version --registry https://registry.npmjs.org/
npm view @stackline/client-errors version --registry http://192.168.3.52:4873/
```

Expected version:

```text
1.0.1
```

## Notes for future releases

- Keep docs source changes in `docs-src`, then rebuild generated `docs`.
- Deploy only this package's documentation directory. Never use a full docs-root `--delete` for a package release:

```bash
rsync -av --delete --chmod=D755,F644 --rsync-path='sudo rsync' docs/ codex-server:/var/www/html/alexandro.net_docs/vanilla/client-errors/
```

- Publish to local Verdaccio from localhost because the saved auth token is host-specific:

```bash
npm publish --registry http://127.0.0.1:4873/ --access public
```
