import { createRule } from '../utils';
import { isPandaImport, isValidFile } from '../utils/helpers';
import { type TSESTree } from '@typescript-eslint/utils';

export const RULE_NAME = 'file-not-included';

const rule = createRule({
  create(context) {
    // Determine if the current file is included in the Panda CSS configuration
    const isFileIncluded = isValidFile(context);

    // If the file is included, no need to proceed
    if (isFileIncluded) {
      return {};
    }

    let hasReported = false;

    return {
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        if (hasReported) {
          return;
        }

        if (!isPandaImport(node, context)) {
          return;
        }

        // Report only on the first import declaration
        context.report({
          messageId: 'include',
          node,
        });

        hasReported = true;
      },
    };
  },
  defaultOptions: [],
  meta: {
    docs: {
      description:
        'Disallow the use of Panda CSS in files that are not included in the specified Panda CSS `include` config.',
    },
    messages: {
      include:
        'The use of Panda CSS is not allowed in this file. Please ensure the file is included in the Panda CSS `include` configuration.',
    },
    schema: [],
    type: 'problem',
  },
  name: RULE_NAME,
});

export default rule;
