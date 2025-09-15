import { type ImportResult } from '.';
import { createContext } from '../../tests/fixtures/create-context';
import { findConfig } from '@pandacss/config';
import { resolveTsPathPattern } from '@pandacss/config/ts-path';
import { loadConfigAndCreateContext, type PandaContext } from '@pandacss/node';
import path from 'path';
import { runAsWorker } from 'synckit';

type Options = {
  configPath?: string;
  currentFile: string;
};

const contextCache: { [configPath: string]: Promise<PandaContext> } = {};

export type DeprecatedToken =
  | string
  | {
      category: string;
      value: string;
    };

export async function getContext(options: Options) {
  if (process.env.NODE_ENV === 'test') {
    const context = createContext() as unknown as PandaContext;
    context.getFiles = () => ['App.tsx'];
    return context;
  } else {
    const configPath = findConfig({
      cwd: options.configPath ?? options.currentFile,
    });

    // The context cache ensures we don't reload the same config multiple times
    if (!contextCache[configPath]) {
      contextCache[configPath] = _getContext(configPath);
    }

    return await contextCache[configPath];
  }
}

async function _getContext(configPath: string | undefined) {
  if (!configPath) {
    throw new Error('Invalid config path');
  }

  const cwd = path.dirname(configPath);

  const context = await loadConfigAndCreateContext({ configPath, cwd });
  return context;
}

// Refactored to arrow function, removed async
const filterDeprecatedTokens = (
  context: PandaContext,
  tokens: DeprecatedToken[],
): DeprecatedToken[] => {
  return tokens.filter((token) => {
    const value =
      typeof token === 'string' ? token : token.category + '.' + token.value;
    return context.utility.tokens.isDeprecated(value);
  });
};

// Refactored to arrow function, removed async
const filterInvalidTokens = (
  context: PandaContext,
  paths: string[],
): string[] => {
  return paths.filter((path) => !context.utility.tokens.view.get(path));
};

// Refactored to arrow function, removed async
const getPropertyCategory = (context: PandaContext, _attribute: string) => {
  const longhand = resolveLongHand(context, _attribute);
  const attribute = longhand || _attribute;
  const attributeConfig = context.utility.config[attribute];
  return typeof attributeConfig?.values === 'string'
    ? attributeConfig.values
    : undefined;
};

// Refactored to arrow function, removed async
const isColorAttribute = (
  context: PandaContext,
  _attribute: string,
): boolean => {
  const category = getPropertyCategory(context, _attribute);
  return category === 'colors';
};

// Refactored to arrow function, removed async
const isColorToken = (context: PandaContext, value: string): boolean => {
  return Boolean(
    context.utility.tokens.view.categoryMap.get('colors')?.get(value),
  );
};

// Refactored to arrow function
const arePathsEqual = (path1: string, path2: string) => {
  const normalizedPath1 = path.resolve(path1);
  const normalizedPath2 = path.resolve(path2);

  return normalizedPath1 === normalizedPath2;
};

type MatchImportResult = {
  alias: string;
  mod: string;
  name: string;
};

export function run(
  action: 'filterInvalidTokens',
  options: Options,
  paths: string[],
): string[];

export function run(
  action: 'isColorToken',
  options: Options,
  value: string,
): boolean;

export function run(
  action: 'isColorAttribute',
  options: Options,
  attribute: string,
): boolean;

export function run(action: 'isValidFile', options: Options): boolean;

export function run(
  action: 'resolveShorthands',
  options: Options,
  name: string,
): string[] | undefined;
export function run(
  action: 'resolveLongHand',
  options: Options,
  name: string,
): string | undefined;

export function run(
  action: 'isValidProperty',
  options: Options,
  name: string,
  patternName?: string,
): boolean;
export function run(
  action: 'matchFile',
  options: Options,
  name: string,
  imports: ImportResult[],
): boolean;
export function run(
  action: 'matchImports',
  options: Options,
  result: MatchImportResult,
): boolean;
export function run(
  action: 'getPropCategory',
  options: Options,
  property: string,
): string;
export function run(
  action: 'filterDeprecatedTokens',
  options: Options,
  tokens: DeprecatedToken[],
): DeprecatedToken[];
export function run(action: string, options: Options, ...args: any[]): any {
  // @ts-expect-error cast
  return runAsync(action, options, ...args);
}

export function runAsync(
  action: 'filterInvalidTokens',
  options: Options,
  paths: string[],
): Promise<string[]>;
export function runAsync(
  action: 'isColorToken',
  options: Options,
  value: string,
): Promise<boolean>;
export function runAsync(
  action: 'isColorAttribute',
  options: Options,
  attribute: string,
): Promise<boolean>;
export function runAsync(
  action: 'isValidFile',
  options: Options,
  fileName: string,
): Promise<string>;
export function runAsync(
  action: 'resolveShorthands',
  options: Options,
  name: string,
): Promise<string[] | undefined>;
export function runAsync(
  action: 'resolveLongHand',
  options: Options,
  name: string,
): Promise<string | undefined>;

export function runAsync(
  action: 'isValidProperty',
  options: Options,
  name: string,
  patternName?: string,
): Promise<boolean>;
export function runAsync(
  action: 'matchFile',
  options: Options,
  name: string,
  imports: ImportResult[],
): Promise<boolean>;
export function runAsync(
  action: 'matchImports',
  options: Options,
  result: MatchImportResult,
): Promise<boolean>;
export function runAsync(
  action: 'getPropCategory',
  options: Options,
  property: string,
): Promise<string>;
export function runAsync(
  action: 'filterDeprecatedTokens',
  options: Options,
  tokens: DeprecatedToken[],
): Promise<DeprecatedToken[]>;
export async function runAsync(
  action: string,
  options: Options,
  ...args: any
): Promise<any> {
  const context = await getContext(options);

  switch (action) {
    case 'filterDeprecatedTokens':
      // @ts-expect-error cast
      return filterDeprecatedTokens(context, ...args);
    case 'filterInvalidTokens':
      // @ts-expect-error cast
      return filterInvalidTokens(context, ...args);
    case 'getPropCategory':
      // @ts-expect-error cast
      return getPropertyCategory(context, ...args);
    case 'isColorAttribute':
      // @ts-expect-error cast
      return isColorAttribute(context, ...args);
    case 'isColorToken':
      // @ts-expect-error cast
      return isColorToken(context, ...args);
    case 'isValidFile':
      return isValidFile(context, options.currentFile);
    case 'isValidProperty':
      // @ts-expect-error cast
      return isValidProperty(context, ...args);
    case 'matchFile':
      // @ts-expect-error cast
      return matchFile(context, ...args);
    case 'matchImports':
      // @ts-expect-error cast
      return matchImports(context, ...args);
    case 'resolveLongHand':
      // @ts-expect-error cast
      return resolveLongHand(context, ...args);
    case 'resolveShorthands':
      // @ts-expect-error cast
      return resolveShorthands(context, ...args);
  }
}

// Refactored to arrow function, removed async
const isValidFile = (context: PandaContext, fileName: string): boolean => {
  return context.getFiles().some((file) => arePathsEqual(file, fileName));
};

// Refactored to arrow function, removed async
const isValidProperty = (
  context: PandaContext,
  name: string,
  patternName?: string,
) => {
  if (context.isValidProperty(name)) {
    return true;
  }

  if (!patternName) {
    return;
  }

  const pattern = context.patterns.details.find(
    (p) => p.baseName === patternName || p.jsx.includes(patternName),
  )?.config.properties;
  if (!pattern) {
    return;
  }

  return Object.keys(pattern).includes(name);
};

// Refactored to arrow function, removed async
const matchFile = (
  context: PandaContext,
  name: string,
  imports: ImportResult[],
) => {
  const file = context.imports.file(imports);
  return file.match(name);
};

// Refactored to arrow function, removed async
const matchImports = (context: PandaContext, result: MatchImportResult) => {
  return context.imports.match(result, (module_) => {
    const { tsOptions } = context.parserOptions;
    if (!tsOptions?.pathMappings) {
      return;
    }

    return resolveTsPathPattern(tsOptions.pathMappings, module_);
  });
};

// Refactored to arrow function, removed async
const resolveLongHand = (
  context: PandaContext,
  name: string,
): string | undefined => {
  const reverseShorthandsMap = new Map();

  for (const [key, values] of context.utility.getPropShorthandsMap()) {
    for (const value of values) {
      reverseShorthandsMap.set(value, key);
    }
  }

  return reverseShorthandsMap.get(name);
};

// Refactored to arrow function, removed async
const resolveShorthands = (
  context: PandaContext,
  name: string,
): string[] | undefined => {
  return context.utility.getPropShorthandsMap().get(name);
};

runAsWorker(run as any);
