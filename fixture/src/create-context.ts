import { mergeConfigs } from '@pandacss/config'
import { Generator } from '@pandacss/generator'
import { PandaContext } from '@pandacss/node'
import { stringifyJson, parseJson } from '@pandacss/shared'
import type { Config, LoadConfigResult, UserConfig } from '@pandacss/types'
import { fixturePreset } from './config'
import sandboxConfig from '../../sandbox/panda.config'

const config: UserConfig = {
  ...fixturePreset,
  optimize: true,
  cwd: '',
  outdir: 'styled-system',
  include: [],
  //
  cssVarRoot: ':where(html)',
  jsxFramework: 'react',
}

export const fixtureDefaults = {
  dependencies: [],
  config,
  path: '',
  hooks: {},
  serialized: stringifyJson(config),
  deserialize: () => parseJson(stringifyJson(config)),
} as LoadConfigResult

export const createGeneratorContext = (userConfig?: Config) => {
  const resolvedConfig = (
    userConfig ? mergeConfigs([userConfig, fixtureDefaults.config]) : fixtureDefaults.config
  ) as UserConfig

  return new Generator({ ...fixtureDefaults, config: resolvedConfig })
}

// TODO why is this unused?
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createContext = (userConfig?: Config) => {
  const resolvedConfig = mergeConfigs([
    fixtureDefaults.config,
    // @ts-expect-error
    sandboxConfig,
    { importMap: './panda' },
  ]) as UserConfig

  return new PandaContext({
    ...fixtureDefaults,
    config: resolvedConfig,
    tsconfig: {
      // @ts-expect-error
      useInMemoryFileSystem: true,
    },
  })
}
