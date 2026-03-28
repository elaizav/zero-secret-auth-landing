import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const entriesToCopy = [
  'assets',
  'en',
  'materials',
  'apple-touch-icon.png',
  'favicon.svg',
  'index.html',
  'robots.txt',
  'script.js',
  'site.webmanifest',
  'sitemap.xml',
  'styles.css'
];

async function build() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  for (const entry of entriesToCopy) {
    await cp(path.join(rootDir, entry), path.join(distDir, entry), {
      recursive: true
    });
  }
}

build().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});
