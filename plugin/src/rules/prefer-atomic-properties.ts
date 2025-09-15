import { createRule } from '../utils'
import { compositeProperties } from '../utils/composite-properties'
import {
  isPandaAttribute,
  isPandaProp as isPandaProperty,
  isRecipeVariant,
  isValidProperty,
  resolveLonghand,
} from '../utils/helpers'
import { isIdentifier, isJSXIdentifier } from '../utils/nodes'
import { type TSESTree } from '@typescript-eslint/utils'

export const RULE_NAME = 'prefer-atomic-properties'

const rule = createRule({
  create(context) {
    const whitelist: string[] = context.options[0]?.whitelist ?? []

    // Cache for resolved longhand properties
    const longhandCache = new Map<string, string>()

    const getLonghand = (name: string): string => {
      if (longhandCache.has(name)) {
        return longhandCache.get(name)!
      }

      const longhand = resolveLonghand(name, context) ?? name
      longhandCache.set(name, longhand)
      return longhand
    }

    // Cache for composite property resolution
    const compositePropertyCache = new Map<string, string | undefined>()

    const resolveCompositeProperty = (name: string): string | undefined => {
      if (compositePropertyCache.has(name)) {
        return compositePropertyCache.get(name)
      }

      if (Object.hasOwn(compositeProperties, name)) {
        compositePropertyCache.set(name, name)
        return name
      }

      const longhand = getLonghand(name)
      if (isValidProperty(longhand, context) && Object.hasOwn(compositeProperties, longhand)) {
        compositePropertyCache.set(name, longhand)
        return longhand
      }

      compositePropertyCache.set(name, undefined)
      return undefined
    }

    // Caches for helper functions
    const pandaPropertyCache = new WeakMap<TSESTree.JSXAttribute, boolean | undefined>()
    const isCachedPandaProperty = (node: TSESTree.JSXAttribute): boolean => {
      if (pandaPropertyCache.has(node)) {
        return pandaPropertyCache.get(node)!
      }

      const result = isPandaProperty(node, context)
      pandaPropertyCache.set(node, result)
      return Boolean(result)
    }

    const pandaAttributeCache = new WeakMap<TSESTree.Property, boolean | undefined>()
    const isCachedPandaAttribute = (node: TSESTree.Property): boolean => {
      if (pandaAttributeCache.has(node)) {
        return pandaAttributeCache.get(node)!
      }

      const result = isPandaAttribute(node, context)
      pandaAttributeCache.set(node, result)
      return Boolean(result)
    }

    const recipeVariantCache = new WeakMap<TSESTree.Property, boolean | undefined>()
    const isCachedRecipeVariant = (node: TSESTree.Property): boolean => {
      if (recipeVariantCache.has(node)) {
        return recipeVariantCache.get(node)!
      }

      const result = isRecipeVariant(node, context)
      recipeVariantCache.set(node, result)
      return Boolean(result)
    }

    const sendReport = (node: TSESTree.Identifier | TSESTree.JSXIdentifier, composite: string) => {
      if (whitelist.includes(node.name)) {
        return
      }

      const atomics = compositeProperties[composite].map((name) => `\`${name}\``).join(',\n')

      context.report({
        data: {
          atomics,
          composite: node.name,
        },
        messageId: 'atomic',
        node,
      })
    }

    return {
      JSXAttribute(node: TSESTree.JSXAttribute) {
        if (!isJSXIdentifier(node.name)) {
          return
        }

        if (!isCachedPandaProperty(node)) {
          return
        }

        const composite = resolveCompositeProperty(node.name.name)
        if (!composite) {
          return
        }

        sendReport(node.name, composite)
      },

      Property(node: TSESTree.Property) {
        if (!isIdentifier(node.key)) {
          return
        }

        if (!isCachedPandaAttribute(node)) {
          return
        }

        if (isCachedRecipeVariant(node)) {
          return
        }

        const composite = resolveCompositeProperty(node.key.name)
        if (!composite) {
          return
        }

        sendReport(node.key, composite)
      },
    }
  },
  defaultOptions: [
    {
      whitelist: [],
    },
  ],
  meta: {
    docs: {
      description: 'Encourage the use of atomic properties instead of composite properties in the codebase.',
    },
    messages: {
      atomic: 'Use atomic properties instead of `{{composite}}`. Prefer: \n{{atomics}}',
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
})

export default rule
