import { ESLintUtils } from '@typescript-eslint/utils';

// Rule creator
export const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/gajus/eslint-plugin-panda/blob/main/docs/rules/${name}.md`,
);

export type ImportResult = {
  alias: string;
  importMapValue?: string;
  mod: string;
  name: string;
};
