import { fixturePreset } from './config';
import { mergeConfigs } from '@pandacss/config';
import { defineConfig } from '@pandacss/dev';
import { PandaContext } from '@pandacss/node';
import { parseJson, stringifyJson } from '@pandacss/shared';
import {
  type Config,
  type LoadConfigResult,
  type UserConfig,
} from '@pandacss/types';

const sandboxConfig = defineConfig({
  exclude: [],
  globalCss: {
    '*': {
      fontFamily: 'Inter',
      margin: '0',
    },
    a: {
      color: 'inherit',
      textDecoration: 'none',
    },
  },
  include: ['./src/**/*.{tsx,jsx}', './pages/**/*.{jsx,tsx}'],
  jsxFactory: 'panda',
  jsxFramework: 'react',
  outdir: 'styled-system',
  preflight: true,
  theme: {
    extend: {
      recipes: {
        button: {
          base: {
            fontSize: 'lg',
          },
          className: 'button',
          compoundVariants: [
            {
              css: {
                fontSize: '12px',
              },
              size: 'sm',
              variant: 'primary',
            },
            {
              css: {
                fontSize: '24px',
                fontWeight: 'bold',
                padding: 4,
              },
              state: 'focused',
              variant: ['primary', 'danger'],
            },
          ],
          description: 'A button styles',
          jsx: ['Button', 'ListedButton', /WithRegex$/, 'PrimaryButtonLike'],
          variants: {
            rounded: {
              true: {
                borderRadius: 'md',
              },
            },
            size: {
              md: {
                borderRadius: 'md',
                padding: '4',
              },
              sm: {
                borderRadius: 'sm',
                padding: '2',
              },
            },
            state: {
              focused: {
                color: 'green',
              },
              hovered: {
                color: 'pink.400',
              },
            },
            variant: {
              danger: {
                backgroundColor: 'red.500',
                color: 'white',
              },
              primary: {
                backgroundColor: 'blue.500',
                color: 'white',
              },
              purple: {
                backgroundColor: 'purple.500',
                color: 'amber.300',
              },
              secondary: {
                backgroundColor: 'green.500',
                color: 'pink.300',
              },
            },
          },
        },
      },
      semanticTokens: {
        colors: {
          bg: {
            value: { _osDark: '{colors.gray.400}', base: '{colors.gray.600}' },
          },
          text: {
            value: { _osDark: '{colors.gray.400}', base: '{colors.gray.600}' },
          },
        },
      },
      tokens: {
        colors: {
          red: {
            '400': {
              deprecated: true,
              description: 'red color',
              value: '#ff0000',
            },
          },
        },
      },
    },
  },
});

const config: UserConfig = {
  ...fixturePreset,
  cssVarRoot: ':where(html)',
  cwd: '',
  include: [],
  jsxFramework: 'react',
  outdir: 'styled-system',
};

const fixtureDefaults = {
  config,
  dependencies: [],
  deserialize: () => parseJson(stringifyJson(config)),
  hooks: {},
  path: '',
  serialized: stringifyJson(config),
} as LoadConfigResult;

// TODO why is this unused?
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createContext = (userConfig?: Config) => {
  const resolvedConfig = mergeConfigs([
    // @ts-expect-error - TODO explain why this is needed
    fixtureDefaults.config as unknown,
    // @ts-expect-error - TODO explain why this is needed
    sandboxConfig as unknown,
    { importMap: './panda' },
  ]) as unknown as UserConfig;

  return new PandaContext({
    ...fixtureDefaults,
    // @ts-expect-error - TODO explain why this is needed
    config: resolvedConfig,
    tsconfig: {
      // @ts-expect-error - TODO explain why this is needed
      useInMemoryFileSystem: true,
    },
  });
};
