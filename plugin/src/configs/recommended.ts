export default {
  parser: '@typescript-eslint/parser',
  parserOptions: { sourceType: 'module' },
  plugins: ['panda'],
  rules: {
    'panda/file-not-included': 'error',
    'panda/no-config-function-in-source': 'error',
    'panda/no-debug': 'warn',
    'panda/no-deprecated-tokens': 'warn',
    'panda/no-dynamic-styling': 'warn',
    'panda/no-hardcoded-color': 'warn',
    'panda/no-invalid-nesting': 'error',
    'panda/no-invalid-token-paths': 'error',
    'panda/no-property-renaming': 'warn',
    'panda/no-unsafe-token-fn-usage': 'warn',
  },
}
