# Error Handling

## Handled error categories

The project addresses the following realistic error types:

- missing assets and unknown routes (`404`)
- invalid self-hosted server configuration
- build copy failures in `build.mjs`
- self-hosted server runtime failures
- unhandled browser JavaScript errors
- unhandled promise rejections in the browser
- navigation enhancement initialization failures

## Error identifiers

- browser runtime errors use `FE-*`
- server request/runtime errors use `SRV-*`
- configuration errors use `CFG-*`
- static `404` cases use `HTTP404-*`
- build failures use `BLD-*`
- session identifiers use `SES-*`

These identifiers appear in structured logs and in user-facing messages where relevant.

## User-facing behavior

### Browser

- `script.js` installs global `error` and `unhandledrejection` handlers
- a fatal banner is shown with localized text in Ukrainian or English
- the banner includes a problem-report link and a diagnostics export action

### Self-hosted server

- unknown files are served with `404.html`
- unexpected internal request failures return `500.html`
- all such cases are logged with context and an error identifier

## Graceful fallback strategy

- if navigation controls are missing, the page continues rendering and a warning is logged
- if section tracking cannot start, the page still works without the active-section highlight
- if a request target is missing, the server returns a professional static `404` page instead of a raw stack trace
- if a request fails unexpectedly, the server returns a `500` page and records the error details in the logs

## Reporting and diagnostics

- browser diagnostics are exposed through `window.zeroSecretDiagnostics`
- stored client logs can be exported for debugging
- the report link points to the repository issue tracker with the error id prefilled
