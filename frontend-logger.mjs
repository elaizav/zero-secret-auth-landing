import {
  LOG_LEVELS,
  createErrorId,
  normalizeLogLevel,
  sanitizeContext,
  shouldLog
} from './log-common.mjs';
import { createProblemReportUrl, getSupportedLanguage, getUserErrorMessage } from './error-messages.mjs';

export const BROWSER_LOG_LEVEL_KEY = 'zeroSecret.logLevel';
export const BROWSER_LOG_STORAGE_KEY = 'zeroSecret.recentLogs';
export const BROWSER_SESSION_KEY = 'zeroSecret.sessionId';
export const MAX_BROWSER_LOGS = 50;

/**
 * Resolves the browser logging level from the query string, local storage, or defaults.
 *
 * @param {object} options Runtime options.
 * @param {string} options.search Query string from the current location.
 * @param {Storage | undefined} options.localStorageRef Storage used for persisted configuration.
 * @returns {'critical' | 'error' | 'warning' | 'info' | 'debug'} Configured browser level.
 */
export function getBrowserLogLevel(options) {
  const params = new URLSearchParams(options.search);
  const queryValue = params.get('logLevel');
  const storedValue = options.localStorageRef?.getItem(BROWSER_LOG_LEVEL_KEY) ?? undefined;
  const resolvedLevel = normalizeLogLevel(queryValue ?? storedValue, 'info');

  options.localStorageRef?.setItem(BROWSER_LOG_LEVEL_KEY, resolvedLevel);
  return resolvedLevel;
}

/**
 * Returns a stable browser-side session id for client diagnostics.
 *
 * @param {Storage | undefined} sessionStorageRef Session storage.
 * @returns {string} Stable session identifier.
 */
export function getOrCreateSessionId(sessionStorageRef) {
  const existingSessionId = sessionStorageRef?.getItem(BROWSER_SESSION_KEY);
  if (existingSessionId) {
    return existingSessionId;
  }

  const sessionId = createErrorId('SES');
  sessionStorageRef?.setItem(BROWSER_SESSION_KEY, sessionId);
  return sessionId;
}

/**
 * Creates a browser logger that writes structured entries to the console and local storage.
 *
 * @param {object} options Logger options.
 * @param {string} options.moduleName Component name recorded in each log entry.
 * @param {string} options.languageCode Page language.
 * @param {Location} options.locationRef Browser location object.
 * @param {Console} options.consoleRef Console implementation.
 * @param {Storage | undefined} options.localStorageRef Local storage used for log persistence.
 * @param {Storage | undefined} options.sessionStorageRef Session storage used for session ids.
 * @returns {{
 *   debug: (message: string, context?: Record<string, unknown>) => void,
 *   info: (message: string, context?: Record<string, unknown>) => void,
 *   warning: (message: string, context?: Record<string, unknown>) => void,
 *   error: (message: string, context?: Record<string, unknown>) => string,
 *   critical: (message: string, context?: Record<string, unknown>) => string,
 *   exportLogs: () => string,
 *   getEntries: () => object[],
 *   getSessionId: () => string
 * }} Browser logger API.
 */
export function createBrowserLogger(options) {
  const currentLevel = getBrowserLogLevel({
    search: options.locationRef.search,
    localStorageRef: options.localStorageRef
  });
  const sessionId = getOrCreateSessionId(options.sessionStorageRef);
  const language = getSupportedLanguage(options.languageCode);

  /**
   * Returns the currently stored log entries.
   *
   * @returns {object[]} Stored browser entries.
   */
  function getEntries() {
    const serialized = options.localStorageRef?.getItem(BROWSER_LOG_STORAGE_KEY);
    if (!serialized) {
      return [];
    }

    try {
      const parsedEntries = JSON.parse(serialized);
      return Array.isArray(parsedEntries) ? parsedEntries : [];
    } catch {
      return [];
    }
  }

  /**
   * Persists the provided log entry and keeps only the most recent records.
   *
   * @param {Record<string, unknown>} entry Structured browser log entry.
   * @returns {void}
   */
  function persistEntry(entry) {
    const entries = [...getEntries(), entry].slice(-MAX_BROWSER_LOGS);
    options.localStorageRef?.setItem(BROWSER_LOG_STORAGE_KEY, JSON.stringify(entries));
  }

  /**
   * Emits a browser log entry if the level passes the current runtime filter.
   *
   * @param {'debug' | 'info' | 'warning' | 'error' | 'critical'} level Entry level.
   * @param {string} message Human-readable message.
   * @param {Record<string, unknown>} [context] Structured metadata.
   * @returns {string} Generated error id for error-level entries, otherwise an empty string.
   */
  function emit(level, message, context = {}) {
    if (!shouldLog(level, currentLevel)) {
      return '';
    }

    const errorId = LOG_LEVELS[level] <= LOG_LEVELS.error ? createErrorId('FE') : '';
    const entry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      module: options.moduleName,
      message,
      ...sanitizeContext({
        errorId: errorId || undefined,
        sessionId,
        language,
        url: options.locationRef.href,
        details: context
      })
    };

    persistEntry(entry);

    const consoleMethod = level === 'debug'
      ? 'debug'
      : level === 'info'
        ? 'info'
        : level === 'warning'
          ? 'warn'
          : 'error';

    options.consoleRef[consoleMethod](entry);
    return errorId;
  }

  return {
    debug(message, context = {}) {
      emit('debug', message, context);
    },
    info(message, context = {}) {
      emit('info', message, context);
    },
    warning(message, context = {}) {
      emit('warning', message, context);
    },
    error(message, context = {}) {
      return emit('error', message, context);
    },
    critical(message, context = {}) {
      return emit('critical', message, context);
    },
    exportLogs() {
      return JSON.stringify(getEntries(), null, 2);
    },
    getEntries,
    getSessionId() {
      return sessionId;
    }
  };
}

/**
 * Shows a fatal error banner with localized text and diagnostics actions.
 *
 * @param {object} options Banner options.
 * @param {Document} options.documentRef Current document.
 * @param {string} options.languageCode Current language.
 * @param {'navigation_init_failed' | 'unexpected_error' | 'asset_missing' | 'server_unavailable'} options.messageKey Localized message key.
 * @param {string} options.errorId Generated error identifier.
 * @param {string} options.pageUrl Current page URL.
 * @param {() => string} options.exportLogs Callback used to export browser logs.
 * @returns {void}
 */
export function showFatalErrorBanner(options) {
  if (options.documentRef.getElementById('fatal-error-banner')) {
    return;
  }

  const message = getUserErrorMessage(options.languageCode, options.messageKey);
  const reportUrl = createProblemReportUrl(options.languageCode, options.errorId, options.pageUrl);
  const container = options.documentRef.createElement('section');
  container.id = 'fatal-error-banner';
  container.className = 'fatal-banner';
  container.setAttribute('role', 'alert');

  container.innerHTML = `
    <div class="fatal-banner__content">
      <p class="fatal-banner__eyebrow">${options.errorId}</p>
      <h2>${message.title}</h2>
      <p>${message.description}</p>
      <div class="fatal-banner__actions">
        <a class="btn btn--primary" href="${reportUrl}" target="_blank" rel="noreferrer">${message.action}</a>
        <button class="btn btn--ghost" type="button" id="fatal-error-export">Export diagnostics</button>
      </div>
    </div>
  `;

  options.documentRef.body.prepend(container);

  const exportButton = options.documentRef.getElementById('fatal-error-export');
  if (exportButton instanceof HTMLButtonElement) {
    exportButton.addEventListener('click', async () => {
      const exportedLogs = options.exportLogs();

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(exportedLogs);
      }
    });
  }
}

/**
 * Registers global error listeners for client-side diagnostics.
 *
 * @param {object} options Runtime integration options.
 * @param {Window} options.windowRef Current window.
 * @param {Document} options.documentRef Current document.
 * @param {string} options.languageCode Current language.
 * @param {ReturnType<typeof createBrowserLogger>} options.logger Browser logger instance.
 * @returns {void}
 */
export function installGlobalErrorHandlers(options) {
  /**
   * Renders the localized fatal banner for the provided message key.
   *
   * @param {'navigation_init_failed' | 'unexpected_error' | 'asset_missing' | 'server_unavailable'} messageKey Localized banner key.
   * @param {string} errorId Error identifier to display.
   * @returns {void}
   */
  const showBanner = (messageKey, errorId) => {
    showFatalErrorBanner({
      documentRef: options.documentRef,
      languageCode: options.languageCode,
      messageKey,
      errorId,
      pageUrl: options.windowRef.location.href,
      exportLogs: options.logger.exportLogs
    });
  };

  options.windowRef.addEventListener('error', (event) => {
    const errorId = options.logger.critical('Unhandled browser error', {
      fileName: event.filename,
      lineNumber: event.lineno,
      columnNumber: event.colno,
      message: event.message
    });

    showBanner('unexpected_error', errorId);
  });

  options.windowRef.addEventListener('unhandledrejection', (event) => {
    const errorId = options.logger.critical('Unhandled promise rejection', {
      reason: String(event.reason)
    });

    showBanner('unexpected_error', errorId);
  });
}
