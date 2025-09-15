import { eslintTester } from '../test-utils'
import rule, { RULE_NAME } from '../src/rules/no-deprecated-tokens'
import multiline from 'multiline-ts'

eslintTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: multiline`
  import { css } from './panda/css';
  
  const styles = css({ color: 'red.100' })`,
    },
  ],
  invalid: [
    {
      code: multiline`
  import { css } from './panda/css';
  
  // Assumes that the token is deprecated
  const styles = css({ color: 'red.400' })`,
      errors: [{ messageId: 'noDeprecatedTokens' }],
    },
  ],
})
