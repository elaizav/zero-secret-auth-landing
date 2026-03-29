# Performance Report

## Methodology

- Tooling: Node.js `performance.now()` from `node:perf_hooks` and `process.memoryUsage().heapUsed` deltas.
- Datasets: deterministic `small`, `medium`, and `large` scenarios with the same iteration counts before and after optimization.
- Scope: browser-side navigation logic, browser logger persistence, and static build copy operations.
- DB profiling: not applicable because the project is a static HTML/CSS/JS site without a database.

## Baseline hot spots

- `build-copy-entries` (large) - 954.3457 ms
- `browser-logger-persistence` (large) - 260.6227 ms
- `navigation-active-section` (large) - 13.9778 ms

## Implemented optimizations

- Navigation highlighting now reuses prepared tracker metadata instead of toggling every link on every update.
- Browser log persistence now keeps a warm in-memory buffer instead of reparsing serialized storage on each emitted entry.
- Static build copy operations now run in parallel across project entries instead of waiting for each entry sequentially.

## Comparison table

| Scenario | Dataset | Baseline mean ms | Optimized mean ms | Improvement % | Baseline heap KB | Optimized heap KB |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| navigation-active-section | small | 0.0811 | 0.006 | 92.6 | 23.0885 | 2.7526 |
| browser-logger-persistence | small | 8.6041 | 5.5004 | 36.07 | 127.8763 | 277.222 |
| build-copy-entries | small | 58.8317 | 23.7532 | 59.63 | -105.8151 | -35.3965 |
| navigation-active-section | medium | 0.7435 | 0.0455 | 93.88 | 64.5615 | 13.2715 |
| browser-logger-persistence | medium | 65.3683 | 35.9394 | 45.02 | -198.9502 | 175.5674 |
| build-copy-entries | medium | 281.482 | 110.248 | 60.83 | 294.1182 | -2.666 |
| navigation-active-section | large | 13.9778 | 0.2297 | 98.36 | -26.7063 | 68.3484 |
| browser-logger-persistence | large | 260.6227 | 133.4108 | 48.81 | -158.4047 | -952.5297 |
| build-copy-entries | large | 954.3457 | 305.6417 | 67.97 | -92.7031 | 189.0016 |

## Real project build time

- Baseline: `24.7298 ms`
- Optimized: `10.4416 ms`
- Improvement: `57.78%`

## Remaining hot spots and limitations

- Measurements run in Node.js with deterministic synthetic scenarios; browser repaint and layout costs are intentionally outside scope.
- The project has no DBMS, ORM, or server-side business transactions, so DB profiling and query analysis are not applicable.
- File-system benchmarks can vary slightly across machines, but the same methodology and datasets were reused for both runs.