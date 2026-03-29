import fs from 'node:fs';
import path from 'node:path';

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { LOG_LEVELS, normalizeLogLevel, sanitizeContext } from './log-common.mjs';

const defaultLogDir = path.join(process.cwd(), 'logs');

/**
 * @typedef {winston.Logger & {
 *   critical: (message: string, metadata?: Record<string, unknown>) => winston.Logger
 * }} ExtendedLogger
 */

/**
 * Creates a Winston logger configured for the static server and build scripts.
 *
 * @param {object} options Logger configuration.
 * @param {string} options.moduleName Component name stored in structured log output.
 * @param {string} [options.level] Minimum log level. Invalid values fall back to `info`.
 * @param {string} [options.logDir] Directory where rotating files are stored.
 * @returns {ExtendedLogger} Configured Winston logger instance.
 */
export function createNodeLogger(options) {
  const level = normalizeLogLevel(options.level ?? process.env.LOG_LEVEL, 'info');
  const logDir = options.logDir ?? defaultLogDir;

  fs.mkdirSync(logDir, { recursive: true });

  const structuredFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.printf((entry) => JSON.stringify({
      timestamp: entry.timestamp,
      level: String(entry.level).toUpperCase(),
      module: entry.module,
      message: entry.message,
      ...sanitizeContext({
        errorId: entry.errorId,
        requestId: entry.requestId,
        sessionId: entry.sessionId,
        method: entry.method,
        statusCode: entry.statusCode,
        url: entry.url,
        language: entry.language,
        userAgent: entry.userAgent,
        details: entry.details,
        stack: entry.stack
      })
    }))
  );

  const logger = /** @type {ExtendedLogger} */ (winston.createLogger({
    levels: LOG_LEVELS,
    level,
    defaultMeta: { module: options.moduleName },
    transports: [
      new winston.transports.Console({
        format: structuredFormat
      }),
      new DailyRotateFile({
        dirname: logDir,
        filename: 'application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxFiles: '14d',
        format: structuredFormat
      }),
      new DailyRotateFile({
        dirname: logDir,
        filename: 'error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxFiles: '30d',
        format: structuredFormat
      })
    ]
  }));

  return logger;
}
