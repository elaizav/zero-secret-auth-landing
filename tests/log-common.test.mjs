import test from 'node:test';
import assert from 'node:assert/strict';

import { createErrorId, normalizeLogLevel, shouldLog } from '../log-common.mjs';
import { createProblemReportUrl, getUserErrorMessage } from '../error-messages.mjs';
import { getBrowserLogLevel } from '../frontend-logger.mjs';
import { parseServerArguments, resolveStaticPath } from '../server.mjs';

test('normalizeLogLevel falls back to info for unsupported values', () => {
  assert.equal(normalizeLogLevel('WARNING'), 'warning');
  assert.equal(normalizeLogLevel('invalid'), 'info');
});

test('shouldLog respects the configured minimum level', () => {
  assert.equal(shouldLog('error', 'info'), true);
  assert.equal(shouldLog('debug', 'warning'), false);
});

test('createErrorId produces stable values with deterministic input', () => {
  assert.equal(
    createErrorId('FE', { now: 1234567890, randomValue: 0.123456 }),
    'FE-1234567890-123456'
  );
});

test('localized messages return the expected language bundle', () => {
  assert.equal(getUserErrorMessage('uk', 'unexpected_error').action, 'Надіслати опис проблеми');
  assert.equal(getUserErrorMessage('en', 'server_unavailable').title, 'The server is temporarily unavailable');
});

test('problem report URLs include the error id', () => {
  const reportUrl = createProblemReportUrl('en', 'FE-123', 'https://example.com/page');
  assert.match(reportUrl, /FE-123/);
  assert.match(reportUrl, /issues\/new/);
});

test('browser log level prefers query parameter over storage', () => {
  const storage = new Map([['zeroSecret.logLevel', 'error']]);
  /** @type {Storage} */
  const storageAdapter = {
    length: 1,
    clear() {
      storage.clear();
    },
    getItem(/** @type {string} */ key) {
      return storage.get(key) ?? null;
    },
    key() {
      return null;
    },
    removeItem(/** @type {string} */ key) {
      storage.delete(key);
    },
    setItem(/** @type {string} */ key, /** @type {string} */ value) {
      storage.set(key, value);
    }
  };

  assert.equal(
    getBrowserLogLevel({ search: '?logLevel=debug', localStorageRef: storageAdapter }),
    'debug'
  );
});

test('server arguments parse root, port, host, and log level', () => {
  const argumentsResult = parseServerArguments([
    '--root=dist',
    '--host=0.0.0.0',
    '--port=5050',
    '--log-level=warning'
  ]);

  assert.equal(argumentsResult.host, '0.0.0.0');
  assert.equal(argumentsResult.port, 5050);
  assert.equal(argumentsResult.level, 'warning');
  assert.match(argumentsResult.root, /dist$/);
});

test('resolveStaticPath rejects path traversal', () => {
  assert.throws(
    () => resolveStaticPath('C:\\site', '/../../secrets.txt'),
    /Path traversal/
  );
});
