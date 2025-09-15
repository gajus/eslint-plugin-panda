/** @type {import('lint-staged').Configuration} */
module.exports = {
  '*': ['pnpm format'],
  '**/*.{ts,tsx,cjs,js,jsx,json}': () => [
    'pnpm run build',
    'pnpm run lint:tsc',
    'pnpm run lint:knip',
    'pnpm run test:vitest',
  ],
};
