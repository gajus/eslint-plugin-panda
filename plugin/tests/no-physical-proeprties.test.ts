import { eslintTester } from '../test-utils'
import rule, { RULE_NAME } from '../src/rules/no-physical-properties'

import multiline from 'multiline-ts'

const valids = [
  {
    code: multiline`
import { css } from './panda/css';

const styles = css({ insetInlineStart: '0' })`,
  },

  {
    code: multiline`
import { css } from './panda/css';

function App(){
  return <div className={css({ marginInlineStart: '4' })} />;
}`,
  },

  {
    code: multiline`
import { Circle } from './panda/jsx';

function App(){
  return <Circle _hover={{  borderBlockEnd: 'solid 1px' }} />;
}`,
  },

  // textAlign with non-physical values - regular object literal
  {
    code: multiline`
import { css } from './panda/css';

const styles = css({ textAlign: 'start' })`,
  },

  {
    code: multiline`
import { css } from './panda/css';

function App(){
  return <div className={css({ textAlign: 'end' })} />;
}`,
  },

  // textAlign with non-physical values - JSX expression container
  {
    code: multiline`
import { Box } from './panda/jsx';

function App(){
  return <Box textAlign={"start"} />;
}`,
  },

  {
    code: multiline`
import { Box } from './panda/jsx';

function App(){
  return <Box textAlign={"end"} />;
}`,
  },
] as const

const invalids = [
  {
    code: multiline`
import { css } from './panda/css';

const styles = css({ left: '0' })`,
  },

  {
    code: multiline`
import { css } from './panda/css';

function App(){
  return <div className={css({ marginLeft: '4' })} />;
}`,
  },

  {
    code: multiline`
import { Circle } from './panda/jsx';

function App(){
  return <Circle _hover={{  borderBottom: 'solid 1px' }} />;
}`,
  },

  // textAlign with physical values - regular object literal
  {
    code: multiline`
import { css } from './panda/css';

const styles = css({ textAlign: 'left' })`,
  },

  {
    code: multiline`
import { css } from './panda/css';

function App(){
  return <div className={css({ textAlign: 'right' })} />;
}`,
  },

  // textAlign with physical values - JSX expression container
  {
    code: multiline`
import { Box } from './panda/jsx';

function App(){
  return <Box textAlign={"left"} />;
}`,
  },

  {
    code: multiline`
import { Box } from './panda/jsx';

function App(){
  return <Box textAlign={"right"} />;
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
