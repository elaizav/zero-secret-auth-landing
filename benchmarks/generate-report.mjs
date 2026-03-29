import fs from 'node:fs/promises';
import path from 'node:path';

const docsDir = path.join(process.cwd(), 'docs');
const baselinePath = path.join(docsDir, 'perf-baseline.json');
const optimizedPath = path.join(docsDir, 'perf-optimized.json');
const reportPath = path.join(docsDir, 'performance.md');

const baseline = JSON.parse(await fs.readFile(baselinePath, 'utf8'));
const optimized = JSON.parse(await fs.readFile(optimizedPath, 'utf8'));

/**
 * @typedef {{
 *   scenario: string,
 *   dataset: string,
 *   meanMs: number,
 *   meanHeapDeltaKb: number
 * }} ScenarioResult
 */

/**
 * @typedef {{
 *   hotspots: { scenario: string, dataset: string, meanMs: number }[],
 *   realBuildMs: number,
 *   scenarios: ScenarioResult[]
 * }} PerfSnapshot
 */

/** @type {PerfSnapshot} */
const typedBaseline = baseline;

/** @type {PerfSnapshot} */
const typedOptimized = optimized;

/**
 * Calculates percentage improvement where a lower time is better.
 *
 * @param {number} beforeValue Baseline value.
 * @param {number} afterValue Optimized value.
 * @returns {number} Percentage improvement.
 */
function getImprovement(beforeValue, afterValue) {
  return Number((((beforeValue - afterValue) / beforeValue) * 100).toFixed(2));
}

const pairedResults = typedBaseline.scenarios.map((baselineScenario) => {
  const optimizedScenario = typedOptimized.scenarios.find((candidate) => (
    candidate.scenario === baselineScenario.scenario
    && candidate.dataset === baselineScenario.dataset
  ));

  if (!optimizedScenario) {
    throw new Error(`Missing optimized result for ${baselineScenario.scenario}/${baselineScenario.dataset}`);
  }

  return {
    scenario: baselineScenario.scenario,
    dataset: baselineScenario.dataset,
    beforeMeanMs: baselineScenario.meanMs,
    afterMeanMs: optimizedScenario.meanMs,
    beforeHeapKb: baselineScenario.meanHeapDeltaKb,
    afterHeapKb: optimizedScenario.meanHeapDeltaKb,
    timeImprovementPercent: getImprovement(baselineScenario.meanMs, optimizedScenario.meanMs)
  };
});

const reportLines = [
  '# Performance Report',
  '',
  '## Methodology',
  '',
  '- Tooling: Node.js `performance.now()` from `node:perf_hooks` and `process.memoryUsage().heapUsed` deltas.',
  '- Datasets: deterministic `small`, `medium`, and `large` scenarios with the same iteration counts before and after optimization.',
  '- Scope: browser-side navigation logic, browser logger persistence, and static build copy operations.',
  '- DB profiling: not applicable because the project is a static HTML/CSS/JS site without a database.',
  '',
  '## Baseline hot spots',
  ''
];

for (const hotspot of typedBaseline.hotspots) {
  reportLines.push(`- \`${hotspot.scenario}\` (${hotspot.dataset}) - ${hotspot.meanMs} ms`);
}

reportLines.push('', '## Implemented optimizations', '');
reportLines.push('- Navigation highlighting now reuses prepared tracker metadata instead of toggling every link on every update.');
reportLines.push('- Browser log persistence now keeps a warm in-memory buffer instead of reparsing serialized storage on each emitted entry.');
reportLines.push('- Static build copy operations now run in parallel across project entries instead of waiting for each entry sequentially.');
reportLines.push('', '## Comparison table', '');
reportLines.push('| Scenario | Dataset | Baseline mean ms | Optimized mean ms | Improvement % | Baseline heap KB | Optimized heap KB |');
reportLines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: |');

for (const result of pairedResults) {
  reportLines.push(
    `| ${result.scenario} | ${result.dataset} | ${result.beforeMeanMs} | ${result.afterMeanMs} | ${result.timeImprovementPercent} | ${result.beforeHeapKb} | ${result.afterHeapKb} |`
  );
}

reportLines.push('', '## Real project build time', '');
reportLines.push(`- Baseline: \`${typedBaseline.realBuildMs} ms\``);
reportLines.push(`- Optimized: \`${typedOptimized.realBuildMs} ms\``);
reportLines.push(`- Improvement: \`${getImprovement(typedBaseline.realBuildMs, typedOptimized.realBuildMs)}%\``);
reportLines.push('', '## Remaining hot spots and limitations', '');
reportLines.push('- Measurements run in Node.js with deterministic synthetic scenarios; browser repaint and layout costs are intentionally outside scope.');
reportLines.push('- The project has no DBMS, ORM, or server-side business transactions, so DB profiling and query analysis are not applicable.');
reportLines.push('- File-system benchmarks can vary slightly across machines, but the same methodology and datasets were reused for both runs.');

await fs.writeFile(reportPath, reportLines.join('\n'), 'utf8');
