import { eslintTester } from '../test-utils'
import rule, { RULE_NAME } from '../src/rules/no-margin-properties'

import multiline from 'multiline-ts';

const valids = [
  {
    code: multiline`
import { css } from './panda/css';

const styles = css({ display: 'flex', gap: '4' })`,
  },

  {
    code: multiline`
import { grid } from './panda/css';

function App(){
  return <div className={grid({ gap: '3' })} />;
}`,
  },

  {
    code: multiline`
import { Flex } from './panda/jsx';

function App(){
  return <Flex gap="2" />;
}`,
  },
] as const

const invalids = [
  {
    code: multiline`
import { css } from './panda/css';

const styles = css({ marginLeft: '4' })`,
  },

  {
    code: multiline`
import { css } from './panda/css';

function App(){
  return <div className={css({ margin: '3' })} />;
}`,
  },

  {
    code: multiline`
import { Circle } from './panda/jsx';

function App(){
  return <Circle marginX="2" />;
}`,
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
