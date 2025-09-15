import { eslintTester } from '../test-utils'
import rule, { RULE_NAME } from '../src/rules/prefer-composite-properties'

import multiline from 'multiline-ts';

const valids = [
  {
    code: multiline`
import { css } from './panda/css';

const styles = css({ gap: '4' })`,
  },

  {
    code: multiline`
import { css } from './panda/css';

function App(){
  return <div className={css({ background: 'red.100' })} />;
}`,
  },

  {
    code: multiline`
import { Circle } from './panda/jsx';

function App(){
  return <Circle _hover={{  borderTop: 'solid 1px blue' }} />;
}`,
  },
] as const

const invalids = [
  {
    code: multiline`
import { css } from './panda/css';

const styles = css({ rowGap: '4', columnGap: '4' })`,
    errors: 2,
  },

  {
    code: multiline`
import { css } from './panda/css';

function App(){
  return <div className={css({ bgColor: 'red.100' })} />;
}`,
  },

  {
    code: multiline`
import { Circle } from './panda/jsx';

function App(){
  return <Circle _hover={{  borderTopStyle: 'solid', borderTopWidth: '1px', borderTopColor: 'blue' }} />;
}`,
    errors: 3,
  },
] as const

eslintTester.run(RULE_NAME, rule, {
  valid: valids.map(({ code }) => ({
    code,
  })),
  invalid: invalids.map(({ code, errors = 1 }) => ({
    code,
    errors,
  })),
})
