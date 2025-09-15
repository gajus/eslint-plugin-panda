<!-- This file is built by build-readme.js. Do not edit it directly; edit README.md.template instead. -->

## ESLint Plugin for Panda CSS

> [!NOTE] This is a fork of [@pandacss/eslint-plugin](https://github.com/chakra-ui/eslint-plugin-panda).

### Installation

```bash
pnpm add -D eslint-plugin-panda
```

### Usage

Add `eslint-plugin-panda` to the plugins section of your `.eslintrc` configuration file. You can omit the
`eslint-plugin` suffix:

```json
{
  "plugins": ["panda"]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "panda/no-debug": "error"
  }
}
```

You can also enable the `recommended` rules in extends:

```diff
{
-   "plugins": ["panda"]
+   "extends": ["plugin:panda/recommended"]
}
```

Or enable all rules in extends:

```diff
{
-   "plugins": ["panda"]
+   "extends": ["plugin:panda/all"]
}
```

> [!WARNING]  
> This is not recommended. You should only enable the rules you need.

### Flat Config

If you use [the flat config format](https://eslint.org/docs/latest/use/configure/configuration-files), you can import
the plugin and rules from `eslint-plugin-panda` and put it into your config.

```js filename="eslint.config.mjs"
import typescriptParser from '@typescript-eslint/parser'
import panda from 'eslint-plugin-panda'

export default [
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    ignores: ['**/*.d.ts', 'styled-system'],
    plugins: {
      panda,
    },
    languageOptions: {
      parser: typescriptParser,
    },
    rules: {
      // Configure rules here
      'panda/no-debug': 'error',
      // You can also use the recommended rules
      ...panda.configs.recommended.rules,
      // Or all rules
      ...panda.configs.all.rules,
    },
  },
]
```

You can see an example using `typescript-eslint` at [sandbox/v9/eslint.config.mjs](./sandbox/v9/eslint.config.mjs).

## Rules

Rules with ⚙️ have options. Click on the rule to see the options.

Where rules are included in the configs `recommended`, or `all` it is indicated below.

| Rule                                                                                     | `recommended` |
| ---------------------------------------------------------------------------------------- | ------------- |
| [`@pandacss/file-not-included`](docs/rules/file-not-included.md)                         | ✔️            |
| [`@pandacss/no-config-function-in-source`](docs/rules/no-config-function-in-source.md)   | ✔️            |
| [`@pandacss/no-debug`](docs/rules/no-debug.md)                                           | ✔️            |
| [`@pandacss/no-deprecated-tokens`](docs/rules/no-deprecated-tokens.md)                   | ✔️            |
| [`@pandacss/no-dynamic-styling`](docs/rules/no-dynamic-styling.md)                       | ✔️            |
| [`@pandacss/no-escape-hatch`](docs/rules/no-escape-hatch.md)                             |               |
| [`@pandacss/no-hardcoded-color`](docs/rules/no-hardcoded-color.md) ⚙️                    | ✔️            |
| [`@pandacss/no-important`](docs/rules/no-important.md)                                   |               |
| [`@pandacss/no-invalid-token-paths`](docs/rules/no-invalid-token-paths.md)               | ✔️            |
| [`@pandacss/no-invalid-nesting`](docs/rules/no-invalid-nesting.md)                       | ✔️            |
| [`@pandacss/no-margin-properties`](docs/rules/no-margin-properties.md) ⚙️                |               |
| [`@pandacss/no-physical-properties`](docs/rules/no-physical-properties.md) ⚙️            |               |
| [`@pandacss/no-property-renaming`](docs/rules/no-property-renaming.md)                   | ✔️            |
| [`@pandacss/no-unsafe-token-fn-usage`](docs/rules/no-unsafe-token-fn-usage.md)           | ✔️            |
| [`@pandacss/prefer-longhand-properties`](docs/rules/prefer-longhand-properties.md) ⚙️    |               |
| [`@pandacss/prefer-shorthand-properties`](docs/rules/prefer-shorthand-properties.md) ⚙️  |               |
| [`@pandacss/prefer-atomic-properties`](docs/rules/prefer-atomic-properties.md) ⚙️        |               |
| [`@pandacss/prefer-composite-properties`](docs/rules/prefer-composite-properties.md) ⚙️  |               |
| [`@pandacss/prefer-unified-property-style`](docs/rules/prefer-unified-property-style.md) |               |

## Settings

### `configPath`

You can tell `eslint` to use a custom panda config file by setting the `configPath` option in your `.eslintrc.js` file.

By default we find the nearest panda config to the linted file.

```js filename=".eslintrc.(c)js"
const path = require('path')

module.exports = {
  plugins: ['panda'],
  settings: {
    'panda/configPath': path.join('PATH-TO/panda.config.js'),
  },
}
```

#### Flat Config

```js filename="eslint.config.mjs"
import panda from 'eslint-plugin-panda'
import path from 'node:path'

export default [
  {
    plugins: {
      panda,
    },
    settings: {
      'panda/configPath': path.join('PATH-TO/panda.config.js'),
    },
  },
]
```
