import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'docs/lint-before.txt',
      'docs/lint-after.txt',
      'docs/typecheck.txt'
    ]
  },
  js.configs.recommended,
  {
    files: ['script.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: {
        ...globals.browser
      }
    },
    rules: {
      'no-console': 'error',
      'no-implicit-globals': 'error',
      'prefer-const': 'error'
    }
  },
  {
    files: ['build.mjs', 'eslint.config.mjs'],
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
  }
];
