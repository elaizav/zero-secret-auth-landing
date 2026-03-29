# Performance Optimized Summary

- Timestamp: `2026-03-29T22:31:06.489Z`
- Commit: `44fe138`
- Real project build time: `10.4416 ms`
- DB profiling: not applicable for this static project.

## Scenario summary

| Scenario | Dataset | Iterations | Mean ms | Min ms | Max ms | Mean heap delta KB |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| navigation-active-section | small | 12 | 0.006 | 0.0052 | 0.0113 | 2.7526 |
| browser-logger-persistence | small | 12 | 5.5004 | 4.4132 | 7.4896 | 277.222 |
| build-copy-entries | small | 12 | 23.7532 | 20.1354 | 29.7609 | -35.3965 |
| navigation-active-section | medium | 8 | 0.0455 | 0.0354 | 0.1099 | 13.2715 |
| browser-logger-persistence | medium | 8 | 35.9394 | 30.3583 | 40.3968 | 175.5674 |
| build-copy-entries | medium | 8 | 110.248 | 95.2495 | 133.7306 | -2.666 |
| navigation-active-section | large | 5 | 0.2297 | 0.1788 | 0.3041 | 68.3484 |
| browser-logger-persistence | large | 5 | 133.4108 | 125.1156 | 139.1721 | -952.5297 |
| build-copy-entries | large | 5 | 305.6417 | 280.2142 | 316.0912 | 189.0016 |

## Hottest operations

- `build-copy-entries` (large) - mean `305.6417 ms`. Static build preparation should scale predictably with additional files.
- `browser-logger-persistence` (large) - mean `133.4108 ms`. Repeated logging should not dominate client-side interaction cost.
- `navigation-active-section` (large) - mean `0.2297 ms`. Active section updates can repeat frequently during scrolling.