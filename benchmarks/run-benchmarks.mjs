import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { execSync } from 'node:child_process';

import { buildSite, copyProjectEntries } from '../build.mjs';
import { createBrowserLogger } from '../frontend-logger.mjs';
import { applyActiveSectionState, createNavigationTracker } from '../script-helpers.mjs';

const mode = process.argv[2];

if (mode !== 'baseline' && mode !== 'optimized') {
  throw new Error('Benchmark mode must be either "baseline" or "optimized".');
}

const docsDir = path.join(process.cwd(), 'docs');
const outputJsonPath = path.join(docsDir, `perf-${mode}.json`);
const outputMarkdownPath = path.join(docsDir, `perf-${mode}.md`);

const datasetMatrix = {
  small: {
    navigationLinks: 24,
    navigationSections: 24,
    loggerWrites: 120,
    buildFiles: 24,
    iterations: 12
  },
  medium: {
    navigationLinks: 180,
    navigationSections: 180,
    loggerWrites: 800,
    buildFiles: 120,
    iterations: 8
  },
  large: {
    navigationLinks: 960,
    navigationSections: 960,
    loggerWrites: 3200,
    buildFiles: 360,
    iterations: 5
  }
};

/**
 * @typedef {{
 *   isActive: boolean,
 *   getAttribute: (name: string) => string | null,
 *   classList: { toggle: (className: string, force?: boolean) => void }
 * }} MockNavigationLink
 */

/**
 * @typedef {{
 *   getItem: (key: string) => string | null,
 *   setItem: (key: string, value: string) => void,
 *   clear: () => void,
 *   key: (index: number) => string | null,
 *   removeItem: (key: string) => void,
 *   length: number
 * }} StorageLike
 */

/**
 * Creates a deterministic mock navigation link for benchmarks.
 *
 * @param {string} href Link href value.
 * @returns {MockNavigationLink} Mock navigation link.
 */
function createMockLink(href) {
  /** @type {MockNavigationLink} */
  const link = {
    isActive: false,
    getAttribute(name) {
      return name === 'href' ? href : null;
    },
    classList: {
      toggle(className, force = false) {
        if (className === 'is-active') {
          link.isActive = Boolean(force);
        }
      }
    }
  };

  return link;
}

/**
 * Returns the provided mock links without additional processing.
 *
 * @param {MockNavigationLink[]} links Mock links.
 * @returns {MockNavigationLink[]} Prepared links.
 */
function connectMockLinkState(links) {
  return links;
}

/**
 * Measures one scenario repeatedly and returns aggregate timing and memory stats.
 *
 * @param {number} iterationCount Number of measured iterations.
 * @param {() => Promise<void> | void} operation Operation measured in each iteration.
 * @returns {Promise<{ iterationCount: number, meanMs: number, minMs: number, maxMs: number, meanHeapDeltaKb: number }>} Aggregate result.
 */
async function measureScenario(iterationCount, operation) {
  const timings = [];
  const heapDeltas = [];

  await operation();

  for (let index = 0; index < iterationCount; index += 1) {
    const heapBefore = process.memoryUsage().heapUsed;
    const startedAt = performance.now();
    await operation();
    const endedAt = performance.now();
    const heapAfter = process.memoryUsage().heapUsed;

    timings.push(endedAt - startedAt);
    heapDeltas.push((heapAfter - heapBefore) / 1024);
  }

  return {
    iterationCount,
    meanMs: Number((timings.reduce((sum, value) => sum + value, 0) / timings.length).toFixed(4)),
    minMs: Number(Math.min(...timings).toFixed(4)),
    maxMs: Number(Math.max(...timings).toFixed(4)),
    meanHeapDeltaKb: Number((heapDeltas.reduce((sum, value) => sum + value, 0) / heapDeltas.length).toFixed(4))
  };
}

/**
 * Creates isolated fixture directories for build-copy benchmarks.
 *
 * @param {number} fileCount Number of synthetic files to create.
 * @returns {Promise<{ sourceRoot: string, outputRoot: string, cleanup: () => Promise<void>, entries: string[] }>} Fixture paths.
 */
async function createBuildFixture(fileCount) {
  const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'zero-secret-auth-perf-'));
  const sourceRoot = path.join(fixtureRoot, 'source');
  const outputRoot = path.join(fixtureRoot, 'output');
  const entries = [];

  await fs.mkdir(sourceRoot, { recursive: true });
  await fs.mkdir(outputRoot, { recursive: true });

  for (let index = 0; index < fileCount; index += 1) {
    const relativePath = path.join('dataset', `group-${Math.floor(index / 20)}`, `file-${index}.txt`);
    const absolutePath = path.join(sourceRoot, relativePath);

    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, `payload-${index}`.repeat(8), 'utf8');
    entries.push(relativePath);
  }

  return {
    sourceRoot,
    outputRoot,
    entries,
    async cleanup() {
      await fs.rm(fixtureRoot, { recursive: true, force: true });
    }
  };
}

/**
 * Measures active-section navigation updates with deterministic synthetic sections.
 *
 * @param {number} linkCount Number of navigation links.
 * @param {number} sectionCount Number of section updates.
 * @param {number} iterationCount Number of measured iterations.
 * @returns {Promise<{ iterationCount: number, meanMs: number, minMs: number, maxMs: number, meanHeapDeltaKb: number }>} Aggregate result.
 */
async function measureNavigationScenario(linkCount, sectionCount, iterationCount) {
  const links = connectMockLinkState(
    Array.from({ length: linkCount }, (_, index) => createMockLink(`#section-${index}`))
  );
  const tracker = createNavigationTracker(links);
  const sectionIds = Array.from({ length: sectionCount }, (_, index) => `section-${index % linkCount}`);

  return measureScenario(iterationCount, () => {
    for (const sectionId of sectionIds) {
      applyActiveSectionState(tracker, sectionId);
    }
  });
}

/**
 * Measures repeated browser log writes with deterministic fake storage.
 *
 * @param {number} writeCount Number of log writes per iteration.
 * @param {number} iterationCount Number of measured iterations.
 * @returns {Promise<{ iterationCount: number, meanMs: number, minMs: number, maxMs: number, meanHeapDeltaKb: number }>} Aggregate result.
 */
async function measureBrowserLoggerScenario(writeCount, iterationCount) {
  const localStorageMap = new Map();
  const sessionStorageMap = new Map();

  /**
   * Creates a storage-like adapter around a Map instance.
   *
   * @param {Map<string, string>} map Backing storage map.
   * @returns {StorageLike} Storage adapter.
   */
  const storageFactory = (map) => ({
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key) {
      return map.get(key) ?? null;
    },
    key(index) {
      return [...map.keys()][index] ?? null;
    },
    removeItem(key) {
      map.delete(key);
    },
    setItem(key, value) {
      map.set(key, value);
    }
  });

  /** @type {Location} */
  const locationRef = /** @type {Location} */ ({
    href: 'https://example.test/zero-secret-auth',
    search: '?logLevel=debug'
  });

  /** @type {Console} */
  const consoleRef = /** @type {Console} */ ({
    debug() {},
    info() {},
    warn() {},
    error() {}
  });

  const logger = createBrowserLogger({
    moduleName: 'perf-browser',
    languageCode: 'en',
    locationRef,
    consoleRef,
    localStorageRef: storageFactory(localStorageMap),
    sessionStorageRef: storageFactory(sessionStorageMap)
  });

  return measureScenario(iterationCount, () => {
    localStorageMap.clear();
    sessionStorageMap.clear();

    for (let index = 0; index < writeCount; index += 1) {
      logger.info('Synthetic navigation event', {
        index,
        href: `#section-${index % 24}`
      });
    }
  });
}

/**
 * Measures copy performance for synthetic static build datasets.
 *
 * @param {number} fileCount Number of synthetic files created in the fixture.
 * @param {number} iterationCount Number of measured iterations.
 * @returns {Promise<{ iterationCount: number, meanMs: number, minMs: number, maxMs: number, meanHeapDeltaKb: number }>} Aggregate result.
 */
async function measureBuildScenario(fileCount, iterationCount) {
  const fixture = await createBuildFixture(fileCount);

  try {
    return await measureScenario(iterationCount, async () => {
      await fs.rm(fixture.outputRoot, { recursive: true, force: true });
      await fs.mkdir(fixture.outputRoot, { recursive: true });
      await copyProjectEntries(fixture.entries, fixture.sourceRoot, fixture.outputRoot);
    });
  } finally {
    await fixture.cleanup();
  }
}

/**
 * Measures the real project build once so the report includes current static build time.
 *
 * @returns {Promise<number>} Measured build duration in milliseconds.
 */
async function measureRealBuild() {
  const startedAt = performance.now();
  await buildSite();
  return Number((performance.now() - startedAt).toFixed(4));
}

const scenarioResults = [];

for (const [datasetName, config] of Object.entries(datasetMatrix)) {
  scenarioResults.push({
    scenario: 'navigation-active-section',
    dataset: datasetName,
    ...await measureNavigationScenario(config.navigationLinks, config.navigationSections, config.iterations)
  });

  scenarioResults.push({
    scenario: 'browser-logger-persistence',
    dataset: datasetName,
    ...await measureBrowserLoggerScenario(config.loggerWrites, config.iterations)
  });

  scenarioResults.push({
    scenario: 'build-copy-entries',
    dataset: datasetName,
    ...await measureBuildScenario(config.buildFiles, config.iterations)
  });
}

const realBuildMs = await measureRealBuild();
const hottestOperations = [...scenarioResults]
  .filter((result) => result.dataset === 'large')
  .sort((left, right) => right.meanMs - left.meanMs)
  .slice(0, 3)
  .map((result) => ({
    scenario: result.scenario,
    dataset: result.dataset,
    meanMs: result.meanMs,
    whyItMatters: result.scenario === 'navigation-active-section'
      ? 'Active section updates can repeat frequently during scrolling.'
      : result.scenario === 'browser-logger-persistence'
        ? 'Repeated logging should not dominate client-side interaction cost.'
        : 'Static build preparation should scale predictably with additional files.'
  }));

const result = {
  timestamp: new Date().toISOString(),
  mode,
  commitHash: execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim(),
  methodology: {
    timingSource: 'node:perf_hooks performance.now()',
    memoryIndicator: 'process.memoryUsage().heapUsed delta',
    dbProfiling: 'Not applicable because the project is a static site without a DBMS.'
  },
  scenarios: scenarioResults,
  realBuildMs,
  hotspots: hottestOperations
};

await fs.mkdir(docsDir, { recursive: true });
await fs.writeFile(outputJsonPath, JSON.stringify(result, null, 2), 'utf8');

const markdownLines = [
  `# Performance ${mode === 'baseline' ? 'Baseline' : 'Optimized'} Summary`,
  '',
  `- Timestamp: \`${result.timestamp}\``,
  `- Commit: \`${result.commitHash}\``,
  `- Real project build time: \`${result.realBuildMs} ms\``,
  '- DB profiling: not applicable for this static project.',
  '',
  '## Scenario summary',
  '',
  '| Scenario | Dataset | Iterations | Mean ms | Min ms | Max ms | Mean heap delta KB |',
  '| --- | --- | ---: | ---: | ---: | ---: | ---: |'
];

for (const scenario of scenarioResults) {
  markdownLines.push(
    `| ${scenario.scenario} | ${scenario.dataset} | ${scenario.iterationCount} | ${scenario.meanMs} | ${scenario.minMs} | ${scenario.maxMs} | ${scenario.meanHeapDeltaKb} |`
  );
}

markdownLines.push('', '## Hottest operations', '');

for (const hotspot of hottestOperations) {
  markdownLines.push(
    `- \`${hotspot.scenario}\` (${hotspot.dataset}) - mean \`${hotspot.meanMs} ms\`. ${hotspot.whyItMatters}`
  );
}

await fs.writeFile(outputMarkdownPath, markdownLines.join('\n'), 'utf8');
