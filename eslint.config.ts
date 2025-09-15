import auto from 'eslint-config-canonical/auto';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  // @ts-expect-error - TODO properly type eslint-config-canonical
  auto,
  {
    rules: {
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-shadow': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
      '@typescript-eslint/unified-signatures': 'off',
      'canonical/filename-match-exported': 'off',
      'canonical/filename-match-regex': 'off',
      'canonical/id-match': 'off',
      'consistent-return': 'off',
      'func-style': 'off',
      'id-length': 'off',
      'import/no-unassigned-import': 'off',
      'jsonc/no-comments': 'off',
      'no-console': 'off',
      'no-negated-condition': 'off',
      'no-unsafe-optional-chaining': 'off',
      'no-unused-vars': 'off',
      'regexp/no-super-linear-backtracking': 'off',
      'regexp/no-unused-capturing-group': 'off',
      'require-unicode-regexp': 'off',
      'unicorn/better-regex': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/no-new-array': 'off',
      'unicorn/prevent-abbreviations': 'off',
    },
  },
  {
    ignores: ['**/dist/', '**/.*/', '**/styled-system/', '**/pnpm-lock.yaml'],
  },
);
