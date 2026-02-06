## Fast ESLint Plugin for Panda CSS

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

<!-- begin auto-generated rules list -->

💼 Configurations enabled in.\
⚠️ Configurations set to warn in.\
🌐 Set in the `all` configuration.\
✅ Set in the `recommended` configuration.\
💡 Manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

| Name                                                                         | Description                                                                                                                                                                                                                     | 💼    | ⚠️    | 💡  |
| :--------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :---- | :---- | :-- |
| [file-not-included](docs/rules/file-not-included.md)                         | Disallow the use of Panda CSS in files that are not included in the specified Panda CSS `include` config.                                                                                                                       | 🌐 ✅ |       |     |
| [no-config-function-in-source](docs/rules/no-config-function-in-source.md)   | Prohibit the use of config functions outside the Panda config file.                                                                                                                                                             | 🌐 ✅ |       | 💡  |
| [no-debug](docs/rules/no-debug.md)                                           | Disallow the inclusion of the debug attribute when shipping code to the production environment.                                                                                                                                 |       | 🌐 ✅ | 💡  |
| [no-deprecated-tokens](docs/rules/no-deprecated-tokens.md)                   | Disallow the use of deprecated tokens within token function syntax.                                                                                                                                                             |       | 🌐 ✅ |     |
| [no-dynamic-styling](docs/rules/no-dynamic-styling.md)                       | Ensure users don't use dynamic styling. Prefer static styles, leverage CSS variables, or recipes for known dynamic styles.                                                                                                      |       | 🌐 ✅ |     |
| [no-escape-hatch](docs/rules/no-escape-hatch.md)                             | Prohibit the use of escape hatch syntax in the code.                                                                                                                                                                            |       | 🌐    | 💡  |
| [no-hardcoded-color](docs/rules/no-hardcoded-color.md)                       | Enforce the exclusive use of design tokens as values for colors within the codebase.                                                                                                                                            |       | 🌐 ✅ |     |
| [no-important](docs/rules/no-important.md)                                   | Disallow usage of !important keyword. Prioritize specificity for a maintainable and predictable styling structure.                                                                                                              |       | 🌐    | 💡  |
| [no-invalid-nesting](docs/rules/no-invalid-nesting.md)                       | Warn against invalid nesting. Nested styles must contain the `&` character.                                                                                                                                                     | ✅    | 🌐    |     |
| [no-invalid-token-paths](docs/rules/no-invalid-token-paths.md)               | Disallow the use of invalid token paths within token function syntax.                                                                                                                                                           | 🌐 ✅ |       |     |
| [no-margin-properties](docs/rules/no-margin-properties.md)                   | Discourage using margin properties for spacing; prefer defining spacing in parent elements with `flex` or `grid` using the `gap` property for a more resilient layout. Margins make components less reusable in other contexts. |       | 🌐    |     |
| [no-physical-properties](docs/rules/no-physical-properties.md)               | Encourage the use of logical properties over physical properties to foster a responsive and adaptable user interface.                                                                                                           |       | 🌐    | 💡  |
| [no-property-renaming](docs/rules/no-property-renaming.md)                   | Ensure that properties for patterns or style props are not renamed, as it prevents proper tracking.                                                                                                                             |       | 🌐 ✅ |     |
| [no-unsafe-token-fn-usage](docs/rules/no-unsafe-token-fn-usage.md)           | Prevent users from using the token function in situations where they could simply use the raw design token.                                                                                                                     |       | 🌐 ✅ | 💡  |
| [prefer-atomic-properties](docs/rules/prefer-atomic-properties.md)           | Encourage the use of atomic properties instead of composite properties in the codebase.                                                                                                                                         |       | 🌐    |     |
| [prefer-composite-properties](docs/rules/prefer-composite-properties.md)     | Encourage the use of composite properties instead of atomic properties in the codebase.                                                                                                                                         |       | 🌐    |     |
| [prefer-longhand-properties](docs/rules/prefer-longhand-properties.md)       | Discourage the use of shorthand properties and promote the preference for longhand properties in the codebase.                                                                                                                  |       | 🌐    | 💡  |
| [prefer-shorthand-properties](docs/rules/prefer-shorthand-properties.md)     | Discourage the use of longhand properties and promote the preference for shorthand properties in the codebase.                                                                                                                  |       | 🌐    | 💡  |
| [prefer-unified-property-style](docs/rules/prefer-unified-property-style.md) | Discourage mixing atomic and composite forms of the same property in a style declaration. Atomic styles give more consistent results.                                                                                           |       | 🌐    |     |

<!-- end auto-generated rules list -->

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

### `@pandacss/eslint-plugin`

This repository started as a fork of [@pandacss/eslint-plugin](https://github.com/chakra-ui/eslint-plugin-panda).

Since then, it has been updated to:

- Added thorough linting and testing.
- Optimized performance.

Here is an example of a performance profile before and after the optimizations.

Before:

```markdown
Rule                                      | Time (ms) | Relative
:-----------------------------------------|----------:|--------:
@pandacss/no-deprecated-tokens            | 13645.357 |    16.9%
@pandacss/no-invalid-token-paths          | 11341.290 |    14.0%
@pandacss/no-dynamic-styling              | 10975.720 |    13.6%
@pandacss/no-property-renaming            |  5253.137 |     6.5%
```

After:

```markdown
Rule                                      | Time (ms) | Relative
:-----------------------------------------|----------:|--------:
panda/no-dynamic-styling                  |  4597.765 |     9.0%
panda/no-deprecated-tokens                |  3655.652 |     7.2%
panda/no-invalid-token-paths              |  2161.846 |     4.2%
panda/no-property-renaming                |  1465.211 |     2.9%
```

