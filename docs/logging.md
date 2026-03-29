# Logging

## Selected tools

- `winston` is used for Node-side runtime logging in self-hosted mode because it supports structured output, configurable levels, and multiple transports.
- `winston-daily-rotate-file` is used for rotating log files without introducing a larger logging stack.
- `frontend-logger.mjs` provides a lightweight browser wrapper around `console`, local storage, and session storage for client diagnostics.

## Runtime modes

### GitHub Pages mode

- only browser-side logging is available
- logs stay in the browser console and in local storage
- there is no server-side request log, file transport, or rotating log file

### Self-hosted mode

- `server.mjs` serves the static files and writes structured logs to console and rotating files
- `build.mjs` also writes structured logs during build preparation

## Log levels

The project uses five levels:

- `DEBUG` for detailed diagnostic events such as copied build entries or active section changes
- `INFO` for normal lifecycle events such as startup, shutdown, request completion, and navigation initialization
- `WARNING` for recoverable problems such as missing assets or unavailable browser features
- `ERROR` for handled failures such as request processing errors and build failures
- `CRITICAL` for invalid runtime configuration, uncaught exceptions, and unhandled promise rejections

## Runtime configuration

### Node server

- minimum level is configured with `LOG_LEVEL`
- supported values: `debug`, `info`, `warning`, `error`, `critical`
- example: `LOG_LEVEL=debug node server.mjs --root=dist`

### Browser

- minimum level is configured with `?logLevel=...` in the URL or with local storage key `zeroSecret.logLevel`
- the selected level is persisted in local storage for later visits

## Structured fields

Server and browser logs include the following fields where applicable:

- `timestamp`
- `level`
- `module`
- `message`
- `errorId`
- `requestId`
- `sessionId`
- `url`
- `language`
- `userAgent`
- `details`

## Handlers and rotation

- console handler for immediate feedback during development and self-hosted serving
- rotating application file logs in `logs/application-YYYY-MM-DD.log`
- rotating error file logs in `logs/error-YYYY-MM-DD.log`
- application logs are retained for 14 days
- error logs are retained for 30 days
