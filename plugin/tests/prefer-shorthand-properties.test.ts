import { tester } from '../test-utils'
import rule, { RULE_NAME } from '../src/rules/prefer-shorthand-properties'

const javascript = String.raw

const valids = [
  {
    code: javascript`
import { css } from './panda/css';

const styles = css({ ml: '4' })`,
  },

  {
    code: javascript`
import { css } from './panda/css';

function App(){
  return <div className={css({ bg: 'red.100' })} />;
}`,
  },

  {
    code: javascript`
import { Circle } from './panda/jsx';

function App(){
  return <Circle _hover={{  pos: 'absolute' }} />;
}`,
  },
] as const

const invalids = [
  {
    code: javascript`
import { css } from './panda/css';

const styles = css({ marginLeft: '4' })`,
  },

  {
    code: javascript`
import { css } from './panda/css';

function App(){
  return <div className={css({ background: 'red.100' })} />;
}`,
  },

  {
    code: javascript`
import { Circle } from './panda/jsx';

function App(){
  return <Circle _hover={{  position: 'absolute' }} />;
}`,
  },
] as const

tester.run(RULE_NAME, rule, {
  valid: valids.map(({ code }) => ({
    code,
  })),
  invalid: invalids.map(({ code }) => ({
    code,
    errors: 1,
  })),
})
