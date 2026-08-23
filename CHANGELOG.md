# Changelog

All notable changes to `@stackline/client-errors` are documented here.

## [Unreleased]

- Tightened GitHub Pages host detection to require an exact DNS label boundary
  and added regression coverage for lookalike hostnames.
- Added a package-specific security policy, confidential reporting path, and
  shipped security guidance.

## [1.0.1] - 2026-08-19

- Updated esbuild to 0.28.2, tsx to 4.23.12, and Node.js 22 development types.
- Forced tsup's nested esbuild onto the patched release line.
- Corrected ESM and CommonJS declaration routing.
- Kept public declarations parseable by TypeScript 3.9 while retaining TypeScript 5.9 for builds.
- Preserved the complete capture, normalization, sanitization, redaction, queue, and transport runtime.
- Added reproducible GitHub Actions packaging with a SHA-512 checksum.
- Added durable AI documentation guides to the generated docs.

## [1.0.0] - 2026-05-22

- Published the stable Stackline browser error reporting SDK and documentation baseline.

[1.0.1]: https://github.com/alexandroit/client-errors/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/alexandroit/client-errors/releases/tag/v1.0.0
