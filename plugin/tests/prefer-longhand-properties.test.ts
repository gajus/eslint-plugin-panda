import { eslintTester } from '../test-utils'
import rule, { RULE_NAME } from '../src/rules/prefer-longhand-properties'

import multiline from 'multiline-ts'

eslintTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: multiline`
  import { css } from './panda/css';
  
  const styles = css({ marginLeft: '4' })`,
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
    return <Circle _hover={{  position: 'absolute' }} />;
  }`,
    },
  ],
  invalid: [
    {
      code: multiline`
  import { css } from './panda/css';
  
  const styles = css({ ml: '4' })`,
      errors: [
        {
          messageId: 'longhand',
          suggestions: [
            {
              messageId: 'replace',
              output: multiline`
  import { css } from './panda/css';
  
  const styles = css({ marginLeft: '4' })`,
            },
          ],
        },
      ],
    },

    {
      code: multiline`
  import { css } from './panda/css';
  
  function App(){
    return <div className={css({ bg: 'red.100' })} />;
  }`,
      errors: [
        {
          messageId: 'longhand',
          suggestions: [
            {
              messageId: 'replace',
              output: multiline`
  import { css } from './panda/css';
  
  function App(){
    return <div className={css({ background: 'red.100' })} />;
  }`,
            },
          ],
        },
      ],
    },

    {
      code: multiline`
  import { Circle } from './panda/jsx';
  
  function App(){
    return <Circle _hover={{  pos: 'absolute' }} />;
  }`,
      errors: [
        {
          messageId: 'longhand',
          suggestions: [
            {
              messageId: 'replace',
              output: multiline`
  import { Circle } from './panda/jsx';
  
  function App(){
    return <Circle _hover={{  position: 'absolute' }} />;
  }`,
            },
          ],
        },
      ],
    },
  ],
})
