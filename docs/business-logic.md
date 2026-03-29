# Business Logic

## Project purpose

The landing page communicates the scope of a bachelor thesis project about Zero Secret Server Authentication. Its role is not to implement an authentication system, but to present the research topic, methodology, expected outcomes, and supporting materials in a clear public form.

## Main information responsibilities

- present the thesis topic in Ukrainian and English;
- explain relevance, goal, tasks, methodology, and expected results;
- link the landing page to extended research materials;
- provide public author and repository references;
- remain suitable for academic presentation and static hosting.

## Documentation logic

The project documentation has two layers:

- explanatory Markdown files in `docs/` for architecture and interaction flow;
- JSDoc-generated HTML reference for the actual JavaScript runtime and build logic.

## Verification logic

The code quality workflow checks:

- JavaScript quality with ESLint;
- CSS quality with Stylelint;
- static type safety with TypeScript in check-only mode;
- documentation examples with Node tests;
- documentation generation with JSDoc scripts.
