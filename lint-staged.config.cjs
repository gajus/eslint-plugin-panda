/** @type {import('./lib/types').Configuration} */
module.exports = {
  '*': ['pnpm format'],
  '**/*.{ts,tsx,cjs,js,jsx,json}': () => [
    'pnpm run lint:knip',
    'pnpm run test:vitest',
  ],
};
