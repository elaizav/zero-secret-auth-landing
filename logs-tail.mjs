import fs from 'node:fs/promises';
import path from 'node:path';

const logDir = path.join(process.cwd(), 'logs');

/**
 * Reads the latest rotating log file and prints its last lines to stdout.
 *
 * @returns {Promise<void>} Resolves when the latest file is printed.
 */
async function tailLatestLogFile() {
  /** @type {{ name: string, modifiedTime: number, size: number }[]} */
  let files;

  try {
    const fileNames = (await fs.readdir(logDir))
      .filter((fileName) => fileName.endsWith('.log'));

    files = await Promise.all(fileNames.map(async (fileName) => {
      const filePath = path.join(logDir, fileName);
      const stats = await fs.stat(filePath);

      return {
        name: fileName,
        modifiedTime: stats.mtimeMs,
        size: stats.size
      };
    }));
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      process.stdout.write('No log files found.\n');
      return;
    }

    throw error;
  }

  const latestFile = files
    .filter((file) => file.size > 0)
    .sort((left, right) => right.modifiedTime - left.modifiedTime)[0];

  if (!latestFile) {
    process.stdout.write('No log files found.\n');
    return;
  }

  const filePath = path.join(logDir, latestFile.name);
  const contents = await fs.readFile(filePath, 'utf8');
  const recentLines = contents.trim().split('\n').slice(-40).join('\n');

  process.stdout.write(`${recentLines}\n`);
}

tailLatestLogFile().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});
