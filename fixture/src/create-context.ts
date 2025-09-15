import sandboxConfig from '../../sandbox/panda.config'
import { fixturePreset } from './config'
import { mergeConfigs } from '@pandacss/config'
import { Generator } from '@pandacss/generator'
import { PandaContext } from '@pandacss/node'
import { parseJson, stringifyJson } from '@pandacss/shared'
import { type Config, type LoadConfigResult, type UserConfig } from '@pandacss/types'

const config: UserConfig = {
  ...fixturePreset,
  cssVarRoot: ':where(html)',
  cwd: '',
  include: [],
  jsxFramework: 'react',
  optimize: true,
  outdir: 'styled-system',
}

export const fixtureDefaults = {
  config,
  dependencies: [],
  deserialize: () => parseJson(stringifyJson(config)),
  hooks: {},
  path: '',
  serialized: stringifyJson(config),
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
    // @ts-expect-error - TODO explain why this is needed
    sandboxConfig,
    { importMap: './panda' },
  ]) as UserConfig

  return new PandaContext({
    ...fixtureDefaults,
    config: resolvedConfig,
    tsconfig: {
      // @ts-expect-error - TODO explain why this is needed
      useInMemoryFileSystem: true,
    },
  })
}
