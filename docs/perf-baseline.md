# Performance Baseline Summary

- Timestamp: `2026-03-29T22:29:36.474Z`
- Commit: `27d94b4`
- Real project build time: `24.7298 ms`
- DB profiling: not applicable for this static project.

## Scenario summary

| Scenario | Dataset | Iterations | Mean ms | Min ms | Max ms | Mean heap delta KB |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| navigation-active-section | small | 12 | 0.0811 | 0.0389 | 0.204 | 23.0885 |
| browser-logger-persistence | small | 12 | 8.6041 | 7.9052 | 10.776 | 127.8763 |
| build-copy-entries | small | 12 | 58.8317 | 54.8755 | 71.7428 | -105.8151 |
| navigation-active-section | medium | 8 | 0.7435 | 0.5697 | 1.1746 | 64.5615 |
| browser-logger-persistence | medium | 8 | 65.3683 | 61.1272 | 74.6341 | -198.9502 |
| build-copy-entries | medium | 8 | 281.482 | 268.1876 | 309.7766 | 294.1182 |
| navigation-active-section | large | 5 | 13.9778 | 13.0241 | 15.6541 | -26.7063 |
| browser-logger-persistence | large | 5 | 260.6227 | 249.626 | 272.8881 | -158.4047 |
| build-copy-entries | large | 5 | 954.3457 | 880.8918 | 1063.6195 | -92.7031 |

## Hottest operations

- `build-copy-entries` (large) - mean `954.3457 ms`. Static build preparation should scale predictably with additional files.
- `browser-logger-persistence` (large) - mean `260.6227 ms`. Repeated logging should not dominate client-side interaction cost.
- `navigation-active-section` (large) - mean `13.9778 ms`. Active section updates can repeat frequently during scrolling.