import { recipes } from './recipes'
import { semanticTokens } from './semantic-tokens'
import { slotRecipes } from './slot-recipes'
import presetBase from '@pandacss/preset-base'
import presetPanda from '@pandacss/preset-panda'
import { type PresetCore, type Theme } from '@pandacss/types'

export const conditions = {
  ...presetBase.conditions,
  dark: '[data-theme=dark] &, .dark &, &.dark, &[data-theme=dark]',
  light: '[data-theme=light] &, .light &, &.light, &[data-theme=light]',
  materialTheme: '[data-color=material] &',
  pastelTheme: '[data-color=pastel] &',
}

const theme = presetPanda.theme
const tokens = {
  ...theme.tokens,
  colors: {
    ...theme.tokens?.colors,
    deep: {
      test: {
        pool: {
          poller: {
            value: '#fff',
          },
          tall: {
            value: '$dfdf',
          },
        },
        yam: {
          value: '%555',
        },
      },
    },
  },
} as Theme['tokens']

const textStyles = {
  headline: {
    h1: {
      value: {
        fontSize: '2rem',
        fontWeight: 'bold',
      },
    },
    h2: {
      value: {
        fontSize: { base: '1.5rem', lg: '2rem' },
        fontWeight: 'bold',
      },
    },
  },
}

export const fixturePreset: Omit<PresetCore, 'globalCss' | 'staticCss'> = {
  ...presetBase,
  conditions,
  theme: {
    ...theme,
    recipes,
    semanticTokens,
    slotRecipes,
    textStyles,
    tokens,
  },
}
