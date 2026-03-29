import js from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import globals from 'globals';

const documentationRuleSet = {
  plugins: {
    jsdoc
  },
  rules: {
    'jsdoc/check-param-names': 'error',
    'jsdoc/check-property-names': 'error',
    'jsdoc/check-tag-names': 'error',
    'jsdoc/require-description': 'error',
    'jsdoc/require-jsdoc': [
      'error',
      {
        contexts: ['FunctionDeclaration', 'ExportNamedDeclaration > FunctionDeclaration']
      }
    ],
    'jsdoc/require-param': 'error',
    'jsdoc/require-param-description': 'error',
    'jsdoc/require-returns': 'error',
    'jsdoc/require-returns-description': 'error'
  }
};

export default [
  {
    ignores: [
      'artifacts/**',
      'dist/**',
      'node_modules/**',
      'reference/**'
    ]
  },
  js.configs.recommended,
  {
    files: ['script.js', 'frontend-logger.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser
      }
    },
    rules: {
      'no-console': 'error',
      'prefer-const': 'error'
    }
  },
  {
    files: ['benchmarks/**/*.mjs', 'build.mjs', 'eslint.config.mjs', 'logger.mjs', 'logs-tail.mjs', 'server.mjs', 'tests/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    },
    rules: {
      'no-console': 'error',
      'prefer-const': 'error'
    }
  },
  {
    files: [
      'build.mjs',
      'error-messages.mjs',
      'frontend-logger.mjs',
      'log-common.mjs',
      'script.js',
      'script-helpers.mjs',
      'server.mjs'
    ],
    ...documentationRuleSet
  }
];
