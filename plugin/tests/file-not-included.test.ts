import rule, { RULE_NAME } from '../src/rules/file-not-included';
import { eslintTester } from '../test-utils';
import multiline from 'multiline-ts';

const validCode = multiline`
// File App.tsx is covered in the include config, so it's okay to import css and Circle from panda into it.

import { css } from './panda/css';
import { Circle } from './panda/jsx';
`;

const invalidCode = multiline`
// File Invalid.tsx is not covered in the include config, so imporing css and Circle from panda into it is not allowed.

import { css } from './panda/css';
import { Circle } from './panda/jsx';
`;

eslintTester.run(RULE_NAME, rule, {
  invalid: [
    {
      code: invalidCode,
      errors: [{ messageId: 'include' }],
      filename: 'Invalid.tsx',
    },
  ],
  valid: [
    {
      code: validCode,
      filename: 'App.tsx',
    },
  ],
});
