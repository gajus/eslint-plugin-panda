import { eslintTester } from '../test-utils'
import rule, { RULE_NAME } from '../src/rules/no-margin-properties'

import multiline from 'multiline-ts'

eslintTester.run(RULE_NAME, rule, {
  valid: [
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
  ],
  invalid: [
    {
      code: multiline`
  import { css } from './panda/css';
  
  const styles = css({ marginLeft: '4' })`,
      errors: [{ messageId: 'noMargin' }],
    },

    {
      code: multiline`
  import { css } from './panda/css';
  
  function App(){
    return <div className={css({ margin: '3' })} />;
  }`,
      errors: [{ messageId: 'noMargin' }],
    },

    {
      code: multiline`
  import { Circle } from './panda/jsx';
  
  function App(){
    return <Circle marginX="2" />;
  }`,
      errors: [{ messageId: 'noMargin' }],
    },
  ],
})
