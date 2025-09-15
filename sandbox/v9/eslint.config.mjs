import eslint from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import panda from 'eslint-plugin-panda'

const compat = new FlatCompat()

export default tseslint.config({
  files: ['**/*.ts', '**/*.tsx'],
  ignores: [
    '**/*.d.ts',
    'styled-system',
    // Ignore panda errors cause that's what we're here for
    // 'src/App.tsx',
  ],
  extends: [
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    ...compat.config(reactHooks.configs.recommended),
  ],
  plugins: {
    panda,
    'react-refresh': reactRefresh,
  },
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.es2020,
    },
  },
  rules: {
    ...panda.configs.recommended.rules,
    'panda/no-margin-properties': 'warn',
    'panda/no-physical-properties': 'error',
    'panda/no-hardcoded-color': ['error', { noOpacity: true, whitelist: ['inherit'] }],
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
})
