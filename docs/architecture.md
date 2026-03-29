# Architecture

## Overview

The repository is a static front-end project for an academic landing page. It intentionally avoids framework tooling and keeps the runtime simple:

- HTML files define the page structure and content.
- `styles.css` provides a shared responsive presentation layer.
- `script.js` adds shared interactive behavior.
- `script-helpers.mjs` contains small reusable helper functions for navigation state and section tracking.
- `build.mjs` creates a minimal deployable copy in `dist/`.

## Architectural decisions

### Static first

The project is designed for GitHub Pages, so the architecture avoids server-side logic and heavy build steps.

### Shared runtime

One browser script is reused by the Ukrainian page, the English page, and the materials page. This reduces drift between versions.

### Testable helpers

The navigation logic includes a small helper module with pure functions. This keeps the browser behavior understandable, documentable, and testable without introducing a framework.

### Separate generated documentation

Generated JSDoc output lives in `reference/`, while explanatory project documentation stays in `docs/`.
