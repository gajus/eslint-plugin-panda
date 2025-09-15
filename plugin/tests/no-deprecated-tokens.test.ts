import { eslintTester } from '../test-utils'
import rule, { RULE_NAME } from '../src/rules/no-deprecated-tokens'

import multiline from 'multiline-ts'

const valids = [
  {
    code: multiline`
import { css } from './panda/css';

const styles = css({ color: 'red.100' })`,
  },
] as const

const invalids = [
  {
    code: multiline`
import { css } from './panda/css';

// Assumes that the token is deprecated
const styles = css({ color: 'red.400' })`,
  },
] as const

eslintTester.run(RULE_NAME, rule, {
  valid: valids.map(({ code }) => ({
    code,
  })),
  invalid: invalids.map(({ code }) => ({
    code,
    errors: 1,
  })),
})
