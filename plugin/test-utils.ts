import { RuleTester } from '@typescript-eslint/rule-tester'

export const eslintTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
})
