# Linting and Static Analysis

## Selected tools

- `ESLint` for JavaScript quality checks in the browser script and support scripts.
- `Stylelint` for stylesheet consistency and invalid CSS detection.
- `TypeScript` in `checkJs` mode for static analysis of JavaScript without generating build output.

This combination fits a small static HTML/CSS/JS project well: it is lightweight, easy to run locally, and adds real quality control without introducing a framework build system.

## What matters for this project

For a static academic landing page, the most important quality aspects are:

- reliable browser-side JavaScript without unsafe DOM assumptions;
- valid and consistent CSS;
- maintainable code style for future lab work;
- checks that remain compatible with GitHub Pages deployment.

## Key linting rules

The configuration focuses on practical rules rather than noisy style policing:

- ESLint recommended rules catch common JavaScript mistakes.
- `prefer-const` helps avoid accidental reassignment.
- `no-implicit-globals` keeps script declarations explicit.
- `no-console` prevents debug logging from staying in production code.
- Stylelint standard rules catch invalid syntax, inconsistent notation, and common stylesheet mistakes.

## Commands

- `npm run lint:js` — run ESLint
- `npm run lint:css` — run Stylelint
- `npm run lint` — run all linters
- `npm run typecheck` — run TypeScript static checking in `checkJs` mode
- `npm run check` — run linting and type checking together
- `npm run build` — run `check` first, then copy the static site into `dist/`

## Static type checking

TypeScript is configured with:

- `allowJs`
- `checkJs`
- `noEmit`

This means JavaScript files are analyzed for type issues, but the project is not converted into a TypeScript build. Any necessary hints are added with minimal JSDoc only where they improve analysis quality.

## Pre-commit hooks

Pre-commit hooks are configured with `husky` and `lint-staged`.

- `husky` runs the Git hook.
- `lint-staged` runs checks only on staged `*.js`, `*.css`, and `*.mjs` files.

This keeps commits fast while still preventing obvious quality regressions from being committed.

## Integration into the workflow

Linting is part of the project verification workflow:

1. `npm run check` performs the full local quality gate.
2. `npm run build` runs `check` before preparing `dist/`.
3. the pre-commit hook runs staged-file checks before a commit is created.

This keeps code quality integrated into everyday development rather than treating linting as a separate afterthought.
