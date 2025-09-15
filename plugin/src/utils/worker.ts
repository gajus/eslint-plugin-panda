import { createContext } from '../../tests/fixtures/create-context';
import { loadConfigAndCreateContextSync } from './loadConfigAndCreateContextSync';
import { findConfig } from '@pandacss/config';
import { type PandaContext } from '@pandacss/node';
import path from 'path';

type Options = {
  configPath?: string;
  currentFile: string;
};

const contextCache: { [configPath: string]: PandaContext } = {};

export type DeprecatedToken =
  | string
  | {
      category: string;
      value: string;
    };

export const getPandaContext = (options: Options) => {
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
      contextCache[configPath] = _getPandaContext(configPath);
    }

    return contextCache[configPath];
  }
};

const _getPandaContext = (configPath: string | undefined) => {
  if (!configPath) {
    throw new Error('Invalid config path');
  }

  const cwd = path.dirname(configPath);

  const context = loadConfigAndCreateContextSync({ configPath, cwd });
  return context;
};
