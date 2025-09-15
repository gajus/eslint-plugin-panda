import rule, { RULE_NAME } from '../src/rules/no-dynamic-styling';
import { eslintTester } from '../test-utils';
import multiline from 'multiline-ts';

eslintTester.run(RULE_NAME, rule, {
  invalid: [
    {
      code: multiline`
  import { css } from './panda/css';
  
  const color = 'red.100';
  const styles = css({ bg: color })`,
      errors: [{ messageId: 'dynamic' }],
    },

    {
      code: multiline`
  import { css } from './panda/css';
  
  const size = '8';
  const styles = css({ padding: ['4', size] })`,
      errors: [{ messageId: 'dynamic' }],
    },

    {
      code: multiline`
  import { stack } from './panda/patterns';
  
  const align = 'center';
  const styles = stack({ align: align })`,
      errors: [{ messageId: 'dynamic' }],
    },

    {
      code: multiline`
  import { Circle } from './panda/jsx';
  
  function App(){
    const bool = true;
    return <Circle debug={bool} />;
  }`,
      errors: [{ messageId: 'dynamic' }],
    },

    {
      code: multiline`
  import { styled } from './panda/jsx';
  
  function App(){
    const color = 'red.100';
    return <styled.div color={color} />;
  }`,
      errors: [{ messageId: 'dynamic' }],
    },

    {
      code: multiline`
  import { css } from './panda/css';
  
  const property = 'background';
  const styles = css({ [property]: 'red.100' })`,
      errors: [{ messageId: 'dynamicProperty' }],
    },

    {
      code: multiline`
  import { cva,sva } from './panda/css';
  
  function App(){
    const computedValue = "value"
    const heading = cva({
      variants: {
        [computedValue]: {
          color: "red.100",
        }
      }
    });
  }`,
      errors: [{ messageId: 'dynamicRecipeVariant' }],
    },
  ],
  valid: [
    {
      code: multiline`
  import { css } from './panda/css';
  
  const styles = css({ bg: 'gray.900' })`,
    },

    {
      code: multiline`
  import { css } from './panda/css';
  
  const styles = css({ padding: ['4', '8'] })`,
    },

    {
      code: multiline`
  import { Circle } from './panda/jsx';
  
  function App(){
    return <Circle debug={true} />;
  }`,
    },

    {
      code: multiline`
  import { styled } from './panda/jsx';
  
  function App(){
    return <styled.div color='red.100' />;
  }`,
    },
    {
      code: multiline`
  const foo = 'foo'
  const nonStyles = {bar: [foo]}
  `,
    },
  ],
});
