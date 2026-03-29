# Component Interactions

## Page structure and runtime interaction

The HTML pages provide:

- navigation links with section anchors;
- a burger button for smaller screens;
- content sections identified by `id` values;
- shared references to `styles.css` and `script.js`.

## Runtime flow

1. The page loads `script.js` as an ES module.
2. `script.js` calls `initializeNavigationEnhancements()`.
3. The script reads the current language from `<html lang>`.
4. Burger-menu state is derived through helper functions from `script-helpers.mjs`.
5. `IntersectionObserver` updates the active navigation link as sections enter the viewport.

## Helper module interaction

`script-helpers.mjs` does not access the DOM directly. It provides:

- localized labels;
- normalized menu state;
- section-link matching logic;
- observer settings.

This separation makes the interaction rules easier to document and test.

## Build and generated documentation interaction

- `build.mjs` copies runtime assets and pages into `dist/`.
- `jsdoc` reads `script.js`, `script-helpers.mjs`, and `build.mjs`.
- `docs:archive` packages the generated `reference/` output for submission.
