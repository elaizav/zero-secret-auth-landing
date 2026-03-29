# Documentation Generation Guide

## Selected tool

The project uses `JSDoc` as the documentation generator because it fits a small static JavaScript codebase with no framework or backend layer.

Short comparison:

- `JSDoc` — best fit for plain JavaScript and simple HTML reference output.
- `TypeDoc` — stronger for TypeScript-heavy projects, unnecessary here.
- `documentation.js` — viable for JS, but less conventional for this lab setup.
- `Doxygen` and `Sphinx` — useful in broader multi-language or Python-oriented projects, not practical for this repository.

## How to generate documentation

Run:

```bash
npm run docs:generate
```

Generated HTML documentation appears in:

- `reference/`

## How to rebuild after code changes

1. Update JSDoc comments in `script.js`, `script-helpers.mjs`, or `build.mjs`.
2. Run `npm run docs:test` to verify executable examples.
3. Run `npm run docs:generate` to rebuild the HTML reference.
4. Run `npm run docs:archive` to regenerate the submission archive.

## Submission archive

The documentation archive is created with:

```bash
npm run docs:archive
```

Archive output:

- `artifacts/jsdoc-reference.zip`
