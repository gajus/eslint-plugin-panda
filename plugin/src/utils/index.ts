import { ruleFinished, ruleStarted } from './cache';
import { type run } from './worker';
import { ESLintUtils, type TSESTree } from '@typescript-eslint/utils';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSyncFn } from 'synckit';

// Rule creator
const _createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/gajus/eslint-plugin-panda/blob/main/docs/rules/${name}.md`,
);

/**
 * Wraps the rule creator so that every rule announces when it starts and
 * finishes linting a file. The per-file cache in `./cache` is discarded once
 * the last rule is done, which keeps cached data from leaking between files in
 * runners such as oxlint that reuse a single rule context object for every
 * file.
 */
export const createRule: typeof _createRule = (...args) => {
  const rule = _createRule(...args);
  const create = rule.create;

  return {
    ...rule,
    create(context) {
      ruleStarted();

      const visitor = create(context);
      const programExit = visitor['Program:exit'];

      return {
        ...visitor,
        'Program:exit'(node: TSESTree.Program) {
          try {
            programExit?.(node);
          } finally {
            ruleFinished();
          }
        },
      };
    },
  };
};

// Determine the distribution directory
const isBase =
  process.env.NODE_ENV !== 'test' || import.meta.url.endsWith('dist/index.js');

const distDir = fileURLToPath(
  new URL(isBase ? './' : '../../dist', import.meta.url),
);

// Create synchronous function using synckit
const _syncAction = createSyncFn(join(distDir, 'utils/worker.mjs'));

// Define syncAction with proper typing and error handling
const cache = new Map<string, any>();

export const syncAction = ((...args: Parameters<typeof run>) => {
  // Generate cache key from arguments
  const cacheKey = JSON.stringify(args);

  // Return cached result if exists
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const result = _syncAction(...args);
    // Store result in cache
    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('syncAction error:', error);
    return undefined;
  }
}) as typeof run;

export type ImportResult = {
  alias: string;
  importMapValue?: string;
  mod: string;
  name: string;
};
