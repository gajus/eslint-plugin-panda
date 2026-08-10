/// <reference types="vitest/globals" />

import rule from '../src/rules/no-important';
import { type TSESTree } from '@typescript-eslint/utils';
import { Linter } from 'eslint';

/**
 * Oxlint reuses a single rule context object for every file it lints, which
 * used to defeat the plugin's context-keyed caches: the first file's imports
 * were served for every subsequent file, so every rule silently stopped
 * reporting.
 * @see https://github.com/gajus/eslint-plugin-panda/issues/6
 */

const pandaFile = `import { css } from './panda/css';

export const t = css({ color: '[inherit !important]' });
`;

const nonPandaFile = `import { createContext } from 'react';

export const X = createContext({ a: 1 });
`;

// Same shape as `pandaFile`, but `css` comes from an unrelated package, so it
// must not be reported.
const lookalikeFile = `import { css } from 'not-panda';

export const t = css({ color: '[inherit !important]' });
`;

const linter = new Linter();

const parseProgram = (filename: string, code: string) => {
  let ast: TSESTree.Program | undefined;

  const messages = linter.verify(
    code,
    [
      {
        files: ['**/*.ts'],
        languageOptions: {
          ecmaVersion: 'latest',
          parserOptions: { ecmaFeatures: { jsx: true } },
          sourceType: 'module',
        },
        plugins: {
          capture: {
            rules: {
              ast: {
                create: (context: any) => ({
                  Program: () => {
                    ast = context.sourceCode.ast;
                  },
                }),
              },
            },
          },
        },
        rules: { 'capture/ast': 'error' },
      },
    ] as any,
    filename,
  );

  if (!ast) {
    throw new Error(`Could not parse ${filename}: ${JSON.stringify(messages)}`);
  }

  return ast;
};

const isNode = (value: unknown): value is TSESTree.Node => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as TSESTree.Node).type === 'string'
  );
};

const traverse = (
  node: TSESTree.Node,
  visit: (node: TSESTree.Node) => void,
) => {
  visit(node);

  for (const [key, value] of Object.entries(node)) {
    if (key === 'parent') {
      continue;
    }

    if (Array.isArray(value)) {
      for (const child of value) {
        if (isNode(child)) {
          traverse(child, visit);
        }
      }
    } else if (isNode(value)) {
      traverse(value, visit);
    }
  }
};

/**
 * Builds the single rule context object that is handed to every rule for every
 * file, the way oxlint's `jsPlugins` bridge does.
 */
const createReusedContext = () => {
  const context = {
    filename: '',
    report({ messageId }: { messageId: string }) {
      context.reports.push(messageId);
    },
    reports: [] as string[],
    settings: {},
    sourceCode: { ast: undefined as TSESTree.Program | undefined },
  };

  return context;
};

const lintFile = (
  context: ReturnType<typeof createReusedContext>,
  filename: string,
  code: string,
) => {
  const ast = parseProgram(filename, code);

  context.filename = filename;
  context.sourceCode.ast = ast;
  context.reports = [];

  const visitor = rule.create(context as any) as Record<
    string,
    ((node: TSESTree.Node) => void) | undefined
  >;

  traverse(ast, (node) => {
    visitor[node.type]?.(node);
  });

  visitor['Program:exit']?.(ast);

  return context.reports;
};

describe('rule context reuse', () => {
  it('reports violations in a file linted after one without Panda imports', () => {
    const context = createReusedContext();

    expect(lintFile(context, 'a.ts', nonPandaFile)).toEqual([]);
    expect(lintFile(context, 'b.styles.ts', pandaFile)).toEqual(['important']);
  });

  it('does not carry Panda imports over into a later file', () => {
    const context = createReusedContext();

    expect(lintFile(context, 'a.styles.ts', pandaFile)).toEqual(['important']);
    expect(lintFile(context, 'b.ts', lookalikeFile)).toEqual([]);
  });

  it('discards cached imports between lint runs of the same file', () => {
    const context = createReusedContext();

    expect(lintFile(context, 'edited.ts', nonPandaFile)).toEqual([]);
    expect(lintFile(context, 'edited.ts', pandaFile)).toEqual(['important']);
  });
});
