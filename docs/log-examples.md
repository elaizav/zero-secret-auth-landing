# Log Examples

## Server startup

```json
{
  "timestamp": "2026-03-29T15:10:00.000Z",
  "level": "INFO",
  "module": "server",
  "message": "Static server started",
  "details": {
    "root": "D:/repo/zero-secret-auth-landing/dist",
    "host": "127.0.0.1",
    "port": 4173,
    "logLevel": "info"
  }
}
```

## Missing asset

```json
{
  "timestamp": "2026-03-29T15:12:11.000Z",
  "level": "WARNING",
  "module": "server",
  "message": "Static asset missing",
  "errorId": "HTTP404-1711725131000-415002",
  "requestId": "8d8d3ef5-6dc2-4a9f-8b17-fb45ee2f4a45",
  "sessionId": "SES-1711725100000-420155",
  "statusCode": 404,
  "url": "/missing.png"
}
```

## Browser fatal error

```json
{
  "timestamp": "2026-03-29T15:13:42.000Z",
  "level": "CRITICAL",
  "module": "browser-runtime",
  "message": "Unhandled promise rejection",
  "errorId": "FE-1711725222000-190244",
  "sessionId": "SES-1711725100000-420155",
  "language": "uk",
  "url": "https://elaizav.github.io/zero-secret-auth-landing/"
}
```

## Build failure

```json
{
  "timestamp": "2026-03-29T15:14:30.000Z",
  "level": "ERROR",
  "module": "build",
  "message": "Static build failed",
  "errorId": "BLD-1711725270000-884002",
  "details": {
    "reason": "ENOENT: no such file or directory"
  }
}
```
