import { type run } from './worker'
import { ESLintUtils } from '@typescript-eslint/utils'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createSyncFn } from 'synckit'

// Rule creator
export const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/gajus/eslint-plugin-panda/blob/main/docs/rules/${name}.md`,
)

// Determine the distribution directory
const isBase = process.env.NODE_ENV !== 'test' || import.meta.url.endsWith('dist/index.js')

const distDir = fileURLToPath(new URL(isBase ? './' : '../../dist', import.meta.url))

// Create synchronous function using synckit
const _syncAction = createSyncFn(join(distDir, 'utils/worker.mjs'))

// Define syncAction with proper typing and error handling
export const syncAction = ((...args: Parameters<typeof run>) => {
  try {
    return _syncAction(...args)
  } catch (error) {
    console.error('syncAction error:', error)
    return undefined
  }
}) as typeof run

export type ImportResult = {
  alias: string
  importMapValue?: string
  mod: string
  name: string
}
