# Performance Benchmark Scenarios

The profiling setup uses deterministic synthetic datasets and the same methodology before and after optimization.

## Dataset sizes

- `small`
- `medium`
- `large`

## Measured scenarios

### navigation-active-section

- simulates repeated section activation updates
- uses synthetic navigation links and section ids
- reflects the cost of the active-link logic used during scrolling

### browser-logger-persistence

- simulates repeated client-side logging writes
- uses deterministic fake storage and a no-op console
- reflects the cost of storing recent browser diagnostics

### build-copy-entries

- creates synthetic file trees in temporary directories
- measures repeated static copy operations for increasing file counts
- reflects the scalability of the project build step

## Methodology

- timing source: `performance.now()`
- memory indicator: `process.memoryUsage().heapUsed`
- iteration counts are fixed per dataset size and reused for baseline and optimized runs
- DB profiling is not applicable because the project does not use a database
