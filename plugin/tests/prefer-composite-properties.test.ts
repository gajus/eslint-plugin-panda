import { eslintTester } from '../test-utils'
import rule, { RULE_NAME } from '../src/rules/prefer-composite-properties'

import multiline from 'multiline-ts'

eslintTester.run(RULE_NAME, rule, {
  valid: [
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
  ],
  invalid: [
    {
      code: multiline`
  import { css } from './panda/css';
  
  const styles = css({ rowGap: '4', columnGap: '4' })`,
      errors: [{ messageId: 'composite' }, { messageId: 'composite' }],
    },

    {
      code: multiline`
  import { css } from './panda/css';
  
  function App(){
    return <div className={css({ bgColor: 'red.100' })} />;
  }`,
      errors: [{ messageId: 'composite' }],
    },

    {
      code: multiline`
  import { Circle } from './panda/jsx';
  
  function App(){
    return <Circle _hover={{  borderTopStyle: 'solid', borderTopWidth: '1px', borderTopColor: 'blue' }} />;
  }`,
      errors: [{ messageId: 'composite' }, { messageId: 'composite' }, { messageId: 'composite' }],
    },
  ],
})
