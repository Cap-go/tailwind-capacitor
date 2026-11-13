import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: [
      'public/r/**',
      'node_modules/**',
      'src/config/md-colors.js',
      'src/vue/**',
      'src/shared/**',
      'example/**',
      'registry/**',
    ],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'off',
    },
  },
];
