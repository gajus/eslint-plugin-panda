import { eslintTester } from '../test-utils'
import rule, { RULE_NAME } from '../src/rules/no-invalid-nesting'

import multiline from 'multiline-ts'

const valids = [
  {
    code: multiline`
import { css } from './panda/css';

const styles = css({
  '&:hover': { marginLeft: '4px' },
})`,
  },

  {
    code: multiline`
import { css } from './panda/css';

function App() {
  return (
    <div
      className={css({
        '.dark &': { background: 'red.100' },
      })}
    />
  );
}`,
  },

  {
    code: multiline`
import { Circle } from './panda/jsx';

function App() {
  return (
    <Circle
      css={{
        '&[data-focus]': { position: 'absolute' },
      }}
    />
  );
}`,
  },
] as const

const invalids = [
  {
    code: multiline`
import { css } from './panda/css';

const styles = css({
  ':hover': { marginLeft: '4px' },
})`,
  },

  {
    code: multiline`
import { css } from './panda/css';

function App() {
  return (
    <div
      className={css({
        '.dark ': { background: 'red.100' },
      })}
    />
  );
}`,
  },

  {
    code: multiline`
import { Circle } from './panda/jsx';

function App() {
  return (
    <Circle
      css={{
        '[data-focus]': { position: 'absolute' },
      }}
    />
  );
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
