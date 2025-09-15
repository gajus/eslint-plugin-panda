import { eslintTester } from '../test-utils'
import rule, { RULE_NAME } from '../src/rules/prefer-unified-property-style'

import multiline from 'multiline-ts'

eslintTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: multiline`
  import { css } from './panda/css';
  
  const styles = css({ marginTop: "2", marginRight: "2", marginBottom: "2", marginLeft: "5" })`,
    },

    {
      code: multiline`
  import { Circle } from './panda/jsx';
  
  function App(){
    return <Circle borderStyle="solid" borderColor="gray.900" borderWidth="1px" />;
  }`,
    },
  ],
  invalid: [
    {
      code: multiline`
  import { css } from './panda/css';
  
  const styles = css({ margin:"2", marginLeft: "5" })`,
      errors: [{ messageId: 'unify' }],
    },

    {
      code: multiline`
  import { Circle } from './panda/jsx';
  
  function App(){
    return <Circle border="solid 1px" borderColor="gray.800" />;
  }`,
      errors: [{ messageId: 'unify' }],
    },
  ],
})
