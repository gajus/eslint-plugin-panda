import { eslintTester } from '../test-utils'
import rule, { RULE_NAME } from '../src/rules/no-invalid-nesting'

import multiline from 'multiline-ts'

eslintTester.run(RULE_NAME, rule, {
  valid: [
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
  ],
  invalid: [
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
  ],
})
