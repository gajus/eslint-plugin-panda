import { type ImportResult } from '.';
import { type ScopeManager } from '@typescript-eslint/scope-manager';

type FileCache = {
  filename: null | string;
  imports: ImportResult[] | null;
  rawImports: ImportResult[] | null;
  scopeAnalysis: null | ScopeManager;
};

/**
 * Data that is expensive to compute but stable for the duration of a single
 * file's lint run, shared by every rule linting that file.
 *
 * This deliberately is not a `WeakMap` keyed by the rule context: oxlint reuses
 * a single context object for every file it lints, so a context-keyed cache
 * serves the first file's imports for every subsequent file, which silently
 * stops every rule from reporting.
 * @see https://github.com/gajus/eslint-plugin-panda/issues/6
 */
const cache: FileCache = {
  filename: null,
  imports: null,
  rawImports: null,
  scopeAnalysis: null,
};

const resetCache = () => {
  cache.filename = null;
  cache.imports = null;
  cache.rawImports = null;
  cache.scopeAnalysis = null;
};

/**
 * Number of rules currently linting a file. Every rule increments this in
 * `create()` and decrements it on `Program:exit` (see `createRule`), so the
 * counter drops back to zero once the last rule is done with the file.
 */
let runningRules = 0;

let resetScheduled = false;

const resetCacheOnMicrotask = () => {
  resetCache();
  runningRules = 0;
  resetScheduled = false;
};

export const ruleStarted = () => {
  runningRules++;

  // Safety net: a rule that throws never reaches `Program:exit`, which would
  // leave the counter stuck above zero and the cache alive indefinitely. That
  // is harmless in the ESLint CLI, which exits on such an error, but not in a
  // language server or a test runner, which carry on. The microtask queue is
  // always drained before the next lint run, so this guarantees the cache never
  // outlives the file it was built for.
  if (!resetScheduled) {
    resetScheduled = true;
    queueMicrotask(resetCacheOnMicrotask);
  }
};

export const ruleFinished = () => {
  runningRules--;

  if (runningRules <= 0) {
    runningRules = 0;
    resetCache();
  }
};

/**
 * Returns the cache for `filename`, discarding anything cached for a different
 * file. The rule counter above already clears the cache between files; this is
 * a second line of defence for runners that never fire `Program:exit`.
 */
export const getFileCache = (filename: string): FileCache => {
  if (cache.filename !== filename) {
    resetCache();
    cache.filename = filename;
  }

  return cache;
};
