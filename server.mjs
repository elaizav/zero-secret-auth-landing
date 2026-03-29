import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

import { createErrorId, normalizeLogLevel } from './log-common.mjs';
import { createNodeLogger } from './logger.mjs';

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.zip': 'application/zip'
};

const rootDir = process.cwd();
const logger = createNodeLogger({
  moduleName: 'server',
  level: process.env.LOG_LEVEL
});

/**
 * Parses the CLI arguments accepted by the static server.
 *
 * @param {string[]} argv Process arguments.
 * @returns {{ root: string, host: string, port: number, level: string }} Server configuration.
 */
export function parseServerArguments(argv) {
  const rootArgument = argv.find((argument) => argument.startsWith('--root='));
  const hostArgument = argv.find((argument) => argument.startsWith('--host='));
  const portArgument = argv.find((argument) => argument.startsWith('--port='));
  const levelArgument = argv.find((argument) => argument.startsWith('--log-level='));
  const port = Number(portArgument?.split('=')[1] ?? process.env.PORT ?? '4173');

  return {
    root: path.resolve(rootDir, rootArgument?.split('=')[1] ?? process.env.STATIC_ROOT ?? '.'),
    host: hostArgument?.split('=')[1] ?? process.env.HOST ?? '127.0.0.1',
    port: Number.isInteger(port) && port > 0 ? port : 4173,
    level: normalizeLogLevel(levelArgument?.split('=')[1] ?? process.env.LOG_LEVEL, 'info')
  };
}

/**
 * Reads a file if it exists and returns null otherwise.
 *
 * @param {string} filePath Absolute file path.
 * @returns {Promise<Buffer | null>} File contents or null.
 */
async function readOptionalFile(filePath) {
  try {
    return await fs.readFile(filePath);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}

/**
 * Returns a session id from the request cookie or creates a new one.
 *
 * @param {http.IncomingMessage} request Current request object.
 * @returns {{ sessionId: string, isNew: boolean }} Session id result.
 */
export function getRequestSession(request) {
  const cookies = request.headers.cookie?.split(';') ?? [];
  const sessionCookie = cookies.find((cookieValue) => cookieValue.trim().startsWith('zs-session='));
  const currentSessionId = sessionCookie?.split('=')[1];

  if (currentSessionId) {
    return { sessionId: currentSessionId, isNew: false };
  }

  return { sessionId: createErrorId('SES'), isNew: true };
}

/**
 * Resolves the requested path to a safe file inside the static root.
 *
 * @param {string} staticRoot Absolute static root.
 * @param {string} requestUrl Request URL.
 * @returns {string} Safe absolute file path.
 * @throws {Error} If the path escapes the static root.
 */
export function resolveStaticPath(staticRoot, requestUrl) {
  const requestPath = decodeURIComponent(requestUrl.split('?')[0] ?? '/');
  const normalizedPath = requestPath.endsWith('/') ? `${requestPath}index.html` : requestPath;
  const safePath = path.normalize(path.join(staticRoot, normalizedPath));
  const relativePath = path.relative(staticRoot, safePath);

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error('Path traversal attempt rejected');
  }

  return safePath;
}

/**
 * Writes a complete HTTP response with predefined content.
 *
 * @param {http.ServerResponse} response Current response object.
 * @param {number} statusCode HTTP status code.
 * @param {string} contentType Response content type.
 * @param {Buffer | string} payload Response body.
 * @returns {void}
 */
function writeResponse(response, statusCode, contentType, payload) {
  response.writeHead(statusCode, { 'Content-Type': contentType });
  response.end(payload);
}

/**
 * Starts the lightweight static server used for self-hosted previews and logging.
 *
 * @param {{ root: string, host: string, port: number, level: string }} configuration Server configuration.
 * @returns {Promise<http.Server>} Started server instance.
 */
export async function startServer(configuration) {
  logger.level = configuration.level;

  try {
    const stats = await fs.stat(configuration.root);
    if (!stats.isDirectory()) {
      throw new Error('Static root is not a directory');
    }
  } catch (error) {
    const errorId = createErrorId('CFG');
    logger.critical('Invalid static server configuration', {
      errorId,
      details: { root: configuration.root, reason: error instanceof Error ? error.message : String(error) }
    });
    throw error;
  }

  const server = http.createServer(async (request, response) => {
    const requestId = randomUUID();
    const { sessionId, isNew } = getRequestSession(request);
    const requestUrl = request.url ?? '/';
    const language = request.headers['accept-language']?.split(',')[0];
    const commonContext = {
      requestId,
      sessionId,
      method: request.method,
      url: requestUrl,
      language,
      userAgent: request.headers['user-agent']
    };

    if (isNew) {
      response.setHeader('Set-Cookie', `zs-session=${sessionId}; Path=/; SameSite=Lax`);
    }

    logger.info('Incoming request', commonContext);

    try {
      const filePath = resolveStaticPath(configuration.root, requestUrl);
      const extension = path.extname(filePath);
      const contentType = mimeTypes[/** @type {keyof typeof mimeTypes} */ (extension)] ?? 'application/octet-stream';

      try {
        const fileStats = await fs.stat(filePath);
        if (!fileStats.isFile()) {
          throw new Error('Requested path is not a file');
        }

        response.writeHead(200, { 'Content-Type': contentType });
        await pipeline(createReadStream(filePath), response);
        logger.info('Request completed', { ...commonContext, statusCode: 200 });
      } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
          const errorId = createErrorId('HTTP404');
          const notFoundPage = await readOptionalFile(path.join(configuration.root, '404.html'));
          const fallback = '404 Not Found';

          writeResponse(response, 404, 'text/html; charset=utf-8', notFoundPage ?? fallback);
          logger.warning('Static asset missing', {
            ...commonContext,
            errorId,
            statusCode: 404,
            details: { filePath }
          });
          return;
        }

        throw error;
      }
    } catch (error) {
      const errorId = createErrorId('SRV');
      const errorPage = await readOptionalFile(path.join(configuration.root, '500.html'));

      writeResponse(response, 500, 'text/html; charset=utf-8', errorPage ?? '500 Internal Server Error');
      logger.error('Static server request failed', {
        ...commonContext,
        errorId,
        statusCode: 500,
        details: { reason: error instanceof Error ? error.message : String(error) }
      });
    }
  });

  server.on('listening', () => {
    logger.info('Static server started', {
      details: {
        root: configuration.root,
        host: configuration.host,
        port: configuration.port,
        logLevel: configuration.level
      }
    });
  });

  server.on('close', () => {
    logger.info('Static server stopped');
  });

  server.on('error', (error) => {
    const errorId = createErrorId('SRV');
    logger.critical('Static server runtime failure', {
      errorId,
      details: { reason: error.message }
    });
  });

  process.on('uncaughtException', (error) => {
    const errorId = createErrorId('SRV');
    logger.critical('Uncaught server exception', {
      errorId,
      details: { reason: error.message }
    });
    process.exitCode = 1;
  });

  process.on('unhandledRejection', (reason) => {
    const errorId = createErrorId('SRV');
    logger.critical('Unhandled server promise rejection', {
      errorId,
      details: { reason: String(reason) }
    });
    process.exitCode = 1;
  });

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      logger.info('Shutdown signal received', { details: { signal } });
      server.close();
    });
  }

  await new Promise((resolve) => {
    server.listen(configuration.port, configuration.host, () => resolve(undefined));
  });

  return server;
}

const executedAsScript = process.argv[1] === fileURLToPath(import.meta.url);

if (executedAsScript) {
  startServer(parseServerArguments(process.argv.slice(2))).catch((error) => {
    logger.critical('Failed to start static server', {
      errorId: createErrorId('CFG'),
      details: { reason: error instanceof Error ? error.message : String(error) }
    });
    process.exitCode = 1;
  });
}
