# GitHub Downloads

This directory contains compiled browser-ready downloads for developers who do not install `@stackline/client-errors` from npm.

Current version:

- [stackline-client-errors-0.1.1.zip](./stackline-client-errors-0.1.1.zip)

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
