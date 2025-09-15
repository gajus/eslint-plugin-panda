import { FlatCompat } from '@eslint/eslintrc';
import eslint from '@eslint/js';
import panda from 'eslint-plugin-panda';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const compat = new FlatCompat();

export default defineConfig({
  extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
  files: ['**/*.ts', '**/*.tsx'],
  ignores: [
    '**/*.d.ts',
    'styled-system',
    // Ignore panda errors cause that's what we're here for
    // 'src/App.tsx',
  ],
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.es2020,
    },
  },
  plugins: {
    panda,
    'react-refresh': reactRefresh,
  },
  rules: {
    ...panda.configs.recommended.rules,
    'panda/no-hardcoded-color': [
      'error',
      { noOpacity: true, whitelist: ['inherit'] },
    ],
    'panda/no-margin-properties': 'warn',
    'panda/no-physical-properties': 'error',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
});
