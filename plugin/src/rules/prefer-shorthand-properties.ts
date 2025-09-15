import { createRule } from '../utils';
import {
  isPandaAttribute,
  isPandaProp as isPandaProperty,
  isRecipeVariant,
  resolveLonghand,
  resolveShorthands,
} from '../utils/helpers';
import { isIdentifier, isJSXIdentifier } from '../utils/nodes';
import { type TSESTree } from '@typescript-eslint/utils';

export const RULE_NAME = 'prefer-shorthand-properties';

const rule = createRule({
  create(context) {
    const whitelist: string[] = context.options[0]?.whitelist ?? [];

    // Cache for resolved longhand properties
    const longhandCache = new Map<string, string | undefined>();

    const getLonghand = (name: string): string | undefined => {
      if (longhandCache.has(name)) {
        return longhandCache.get(name)!;
      }

      const longhand = resolveLonghand(name, context);
      longhandCache.set(name, longhand);
      return longhand;
    };

    // Cache for resolved shorthands
    const shorthandsCache = new Map<string, string[] | undefined>();

    const getShorthands = (name: string): string[] | undefined => {
      if (shorthandsCache.has(name)) {
        return shorthandsCache.get(name)!;
      }

      const shorthands = resolveShorthands(name, context);
      shorthandsCache.set(name, shorthands);
      return shorthands;
    };

    // Caches for helper functions
    const pandaPropertyCache = new WeakMap<
      TSESTree.JSXAttribute,
      boolean | undefined
    >();
    const isCachedPandaProperty = (node: TSESTree.JSXAttribute): boolean => {
      if (pandaPropertyCache.has(node)) {
        return pandaPropertyCache.get(node)!;
      }

      const result = isPandaProperty(node, context);
      pandaPropertyCache.set(node, result);
      return Boolean(result);
    };

    const pandaAttributeCache = new WeakMap<
      TSESTree.Property,
      boolean | undefined
    >();
    const isCachedPandaAttribute = (node: TSESTree.Property): boolean => {
      if (pandaAttributeCache.has(node)) {
        return pandaAttributeCache.get(node)!;
      }

      const result = isPandaAttribute(node, context);
      pandaAttributeCache.set(node, result);
      return Boolean(result);
    };

    const recipeVariantCache = new WeakMap<
      TSESTree.Property,
      boolean | undefined
    >();
    const isCachedRecipeVariant = (node: TSESTree.Property): boolean => {
      if (recipeVariantCache.has(node)) {
        return recipeVariantCache.get(node)!;
      }

      const result = isRecipeVariant(node, context);
      recipeVariantCache.set(node, result);
      return Boolean(result);
    };

    const sendReport = (node: TSESTree.Identifier | TSESTree.JSXIdentifier) => {
      if (whitelist.includes(node.name)) {
        return;
      }

      const longhand = getLonghand(node.name);
      if (longhand) {
        return;
      } // If it's already shorthand, no need to report

      const shorthands = getShorthands(node.name);
      if (!shorthands || shorthands.length === 0) {
        return;
      }

      const shorthandList = shorthands.map((s) => `\`${s}\``).join(', ');

      const data = {
        longhand: node.name,
        shorthand: shorthandList,
      };

      context.report({
        data,
        messageId: 'shorthand',
        node,
        suggest: [
          {
            data,
            fix: (fixer) => fixer.replaceText(node, shorthands[0]),
            messageId: 'replace',
          },
        ],
      });
    };

    return {
      JSXAttribute(node: TSESTree.JSXAttribute) {
        if (!isJSXIdentifier(node.name)) {
          return;
        }

        if (!isCachedPandaProperty(node)) {
          return;
        }

        sendReport(node.name);
      },

      Property(node: TSESTree.Property) {
        if (!isIdentifier(node.key)) {
          return;
        }

        if (!isCachedPandaAttribute(node)) {
          return;
        }

        if (isCachedRecipeVariant(node)) {
          return;
        }

        sendReport(node.key);
      },
    };
  },
  defaultOptions: [
    {
      whitelist: [],
    },
  ],
  meta: {
    docs: {
      description:
        'Discourage the use of longhand properties and promote the preference for shorthand properties in the codebase.',
    },
    hasSuggestions: true,
    messages: {
      replace: 'Replace `{{longhand}}` with `{{shorthand}}`.',
      shorthand:
        'Use shorthand property instead of `{{longhand}}`. Prefer `{{shorthand}}`.',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          whitelist: {
            items: {
              minLength: 0,
              type: 'string',
            },
            type: 'array',
            uniqueItems: true,
          },
        },
        type: 'object',
      },
    ],
    type: 'suggestion',
  },
  name: RULE_NAME,
});

export default rule;
