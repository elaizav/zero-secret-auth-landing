# Zero Secret Auth Landing

Static academic landing page and research materials for the bachelor thesis topic:

`Methodology and Instrumental Tools for Developing Authentication Systems Based on the Zero Secret Server Authentication Model`

GitHub Pages: `https://elaizav.github.io/zero-secret-auth-landing/`

## Repository structure

- `index.html` - Ukrainian main page
- `en/` - English version
- `materials/` - extended research materials
- `assets/` - images and static visual assets
- `styles.css` - shared responsive styling
- `script.js` - shared browser-side behavior
- `script-helpers.mjs` - pure helper functions used by the browser script and tests
- `build.mjs` - minimal static build step for `dist/`
- `docs/` - developer, architecture, deployment, update, backup, and documentation notes
- `reference/` - generated JSDoc reference output

## Development approach

The project follows `Trunk-Based Development` with small direct integrations into `main`.

## Developer onboarding

### Required software

Install the following on a clean machine:

- `Git` for cloning and version control
- `Node.js 22 LTS` or newer with `npm`
- `Python 3` for a simple local static preview server
- a modern browser such as Chrome, Edge, or Firefox

### Environment setup

1. Clone the repository: `git clone https://github.com/elaizav/zero-secret-auth-landing.git`
2. Enter the project directory: `cd zero-secret-auth-landing`
3. Install dependencies: `npm ci`

### Main local commands

- `npm run dev` - serve the repository root with the logging-enabled static server
- `npm run serve` - serve `dist/` with the logging-enabled static server
- `npm run logs:tail` - print recent lines from the latest rotating log file
- `npm run lint` - ESLint and Stylelint
- `npm run typecheck` - TypeScript check-only mode for JavaScript
- `npm run docs:test` - executable documentation examples
- `npm run docs:generate` - HTML reference generation with JSDoc
- `npm run docs:archive` - rebuild the JSDoc site and archive it
- `npm run check` - full project verification
- `npm run build` - verification plus static copy to `dist/`

### Local preview

Quick preview options:

- open `index.html` directly in a browser for a fast content check
- run `npm run dev` for a local static server with request logging and custom error pages
- or run `python -m http.server 8080` in the repository root and open `http://localhost:8080/`
- or use the helper scripts in `docs/scripts/preview-local.ps1` and `docs/scripts/preview-local.sh`

### Basic project operations

- edit static pages, styles, assets, or scripts in place
- run `npm run check` before committing
- run `npm run build` before publishing or preparing a deployment package
- review deployment, update, and backup procedures in `docs/`

## Architecture summary

The runtime architecture is intentionally small:

- browser clients request static HTML, CSS, JavaScript, and image assets
- GitHub Pages or another static web server delivers files from the repository root or from `dist/`
- `npm` tooling is used only during development and build preparation

Components not used in this project:

- no application server
- no DBMS
- no runtime cache service
- no object storage layer beyond ordinary static file hosting

For Lab 7, a lightweight Node static server is included only for self-hosted preview and runtime logging. GitHub Pages compatibility remains unchanged.

## Quality workflow

- `npm run lint` - ESLint and Stylelint
- `npm run typecheck` - TypeScript check-only mode for JavaScript
- `npm run docs:test` - executable documentation examples
- `npm run docs:generate` - HTML reference generation with JSDoc
- `npm run check` - full project verification
- `npm run build` - verification plus static copy to `dist/`

## Documentation policy

The project uses JSDoc for meaningful public functions and build helpers.

Future contributions should:

- document exported or shared functions with JSDoc
- keep `@param`, `@returns`, and `@example` tags aligned with real behavior
- update the Markdown files in `docs/` when architecture, interaction flow, deployment, or research logic changes
- keep tests in `tests/` as executable examples for helper logic
