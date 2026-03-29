import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { createErrorId } from './log-common.mjs';
import { createNodeLogger } from './logger.mjs';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const logger = createNodeLogger({
  moduleName: 'build',
  level: process.env.LOG_LEVEL
});
const entriesToCopy = [
  '404.html',
  '500.html',
  'assets',
  'en',
  'materials',
  'apple-touch-icon.png',
  'error-messages.mjs',
  'favicon.svg',
  'frontend-logger.mjs',
  'index.html',
  'log-common.mjs',
  'robots.txt',
  'script.js',
  'script-helpers.mjs',
  'site.webmanifest',
  'sitemap.xml',
  'styles.css'
];

/**
 * Copies one project entry into the static build directory.
 *
 * @param {string} entry Relative path to a file or folder that belongs in `dist/`.
 * @returns {Promise<void>} Resolves when the copy operation completes.
 * @throws {Error} If the copy operation fails.
 * @example
 * await copyStaticEntry('index.html');
 */
export async function copyStaticEntry(entry) {
  logger.debug('Copying static entry', {
    details: { entry }
  });
  await cp(path.join(rootDir, entry), path.join(distDir, entry), {
    recursive: true
  });
}

/**
 * Builds a deployable static copy of the project in `dist/`.
 *
 * @returns {Promise<void>} Resolves when the output directory is recreated and populated.
 * @throws {Error} If any remove, create, or copy operation fails.
 * @example
 * await buildSite();
 */
export async function buildSite() {
  logger.info('Static build started', {
    details: { distDir, entryCount: entriesToCopy.length }
  });
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  for (const entry of entriesToCopy) {
    await copyStaticEntry(entry);
  }

  logger.info('Static build completed', {
    details: { distDir }
  });
}

const executedAsScript = typeof process.argv[1] === 'string'
  && import.meta.url === pathToFileURL(process.argv[1]).href;

if (executedAsScript) {
  buildSite().catch((error) => {
    logger.error('Static build failed', {
      errorId: createErrorId('BLD'),
      details: { reason: error instanceof Error ? error.message : String(error) }
    });
    process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
