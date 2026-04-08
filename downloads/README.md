# GitHub Downloads

This directory contains compiled browser-ready downloads for developers who do not install `@revivejs/client-errors` from npm.

Current version:

- [revivejs-client-errors-0.1.0.zip](./revivejs-client-errors-0.1.0.zip)

Inside the archive:

- `client-errors.browser.js`
- `README.md`
- `LICENSE`
- `INSTALLATION.txt`

Script tag example:

```html
<script src="./client-errors.browser.js"></script>
<script>
  ReviveClientErrors.initClientErrors({
    endpoint: "api/frontend-errors"
  });
</script>
```
