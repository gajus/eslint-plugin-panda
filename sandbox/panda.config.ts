import { defineConfig } from '@pandacss/dev'

export default defineConfig({
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
})
