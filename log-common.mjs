/**
 * Ordered severity map shared by the browser logger and the Node runtime logger.
 *
 * @type {{ critical: 0, error: 1, warning: 2, info: 3, debug: 4 }}
 */
export const LOG_LEVELS = {
  critical: 0,
  error: 1,
  warning: 2,
  info: 3,
  debug: 4
};

/**
 * Normalizes an arbitrary level value into a supported logging level.
 *
 * @param {string | null | undefined} rawLevel Raw level string from runtime configuration.
 * @param {'critical' | 'error' | 'warning' | 'info' | 'debug'} [fallback='info'] Level used when the input is invalid.
 * @returns {'critical' | 'error' | 'warning' | 'info' | 'debug'} Supported logging level.
 */
export function normalizeLogLevel(rawLevel, fallback = 'info') {
  if (typeof rawLevel !== 'string') {
    return fallback;
  }

  const normalizedLevel = rawLevel.trim().toLowerCase();
  return normalizedLevel in LOG_LEVELS
    ? /** @type {'critical' | 'error' | 'warning' | 'info' | 'debug'} */ (normalizedLevel)
    : fallback;
}

/**
 * Determines whether a log entry should be emitted for the configured minimum level.
 *
 * @param {'critical' | 'error' | 'warning' | 'info' | 'debug'} level Entry level.
 * @param {'critical' | 'error' | 'warning' | 'info' | 'debug'} minimumLevel Configured minimum level.
 * @returns {boolean} `true` when the entry is allowed to pass.
 */
export function shouldLog(level, minimumLevel) {
  return LOG_LEVELS[level] <= LOG_LEVELS[minimumLevel];
}

/**
 * Creates a compact error identifier that can be shown to users and correlated in logs.
 *
 * @param {string} prefix Short component prefix, for example `FE` or `SRV`.
 * @param {{ now?: number, randomValue?: number }} [options] Deterministic values for tests.
 * @returns {string} Error identifier with timestamp and random suffix.
 */
export function createErrorId(prefix, options = {}) {
  const now = typeof options.now === 'number' ? options.now : Date.now();
  const randomValue = typeof options.randomValue === 'number' ? options.randomValue : Math.random();
  const suffix = Math.round(randomValue * 1_000_000).toString().padStart(6, '0');

  return `${prefix}-${now}-${suffix}`;
}

/**
 * Removes `undefined` values from contextual metadata so structured logs stay compact.
 *
 * @param {Record<string, unknown>} context Arbitrary log context.
 * @returns {Record<string, unknown>} Context with undefined values removed.
 */
export function sanitizeContext(context) {
  return Object.fromEntries(
    Object.entries(context).filter(([, value]) => value !== undefined)
  );
}
