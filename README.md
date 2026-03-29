# Zero Secret Auth Landing

Static academic landing page and research materials for the bachelor thesis topic:

`Methodology and Instrumental Tools for Developing Authentication Systems Based on the Zero Secret Server Authentication Model`

GitHub Pages: `https://elaizav.github.io/zero-secret-auth-landing/`

## Repository structure

- `index.html` — Ukrainian main page
- `en/` — English version
- `materials/` — extended research materials
- `script.js` — shared browser-side behavior
- `script-helpers.mjs` — pure helper functions used by the browser script and tests
- `build.mjs` — minimal static build step for `dist/`

## Development approach

The project follows `Trunk-Based Development` with small direct integrations into `main`.

## Quality workflow

- `npm run lint` — ESLint and Stylelint
- `npm run typecheck` — TypeScript check-only mode for JavaScript
- `npm run docs:test` — executable documentation examples
- `npm run docs:generate` — HTML reference generation with JSDoc
- `npm run check` — full project verification
- `npm run build` — verification plus static copy to `dist/`

## Documentation policy

The project uses JSDoc for meaningful public functions and build helpers.

Future contributions should:

- document exported or shared functions with JSDoc;
- keep `@param`, `@returns`, and `@example` tags aligned with real behavior;
- update the Markdown files in `docs/` when architecture, interaction flow, or research logic changes;
- keep tests in `tests/` as executable examples for helper logic.

## Local run

The site does not require a framework build. Open `index.html` in a browser for a quick preview, or run the existing npm verification scripts for the full workflow.
