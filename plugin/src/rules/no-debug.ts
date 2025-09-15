import { createRule } from '../utils'
import { isPandaProp, isPandaAttribute, isRecipeVariant } from '../utils/helpers'
import { TSESTree } from '@typescript-eslint/utils'
import { isJSXExpressionContainer, isObjectExpression } from '../utils/nodes'

export const RULE_NAME = 'no-debug'

const rule = createRule({
  name: RULE_NAME,
  meta: {
    docs: {
      description: 'Disallow the inclusion of the debug attribute when shipping code to the production environment.',
    },
    messages: {
      debug: 'Unnecessary debug utility.',
      prop: 'Remove the debug prop.',
      property: 'Remove the debug property.',
    },
    type: 'problem',
    hasSuggestions: true,
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    // Track processed nodes to avoid duplicate reports
    const processedNodes = new WeakSet<TSESTree.Node>()

    const checkObjectForDebug = (obj: TSESTree.ObjectExpression) => {
      obj.properties.forEach((prop) => {
        if (prop.type !== 'Property') return
        if (!prop.key || prop.key.type !== 'Identifier') return

        // Check for debug property
        if (prop.key.name === 'debug') {
          if (processedNodes.has(prop)) return
          processedNodes.add(prop)

          context.report({
            node: prop.key,
            messageId: 'debug',
            suggest: [
              {
                messageId: 'property',
                fix: (fixer) => fixer.removeRange([prop.range[0], prop.range[1] + 1]),
              },
            ],
          })
        }

        // Check nested objects (for pseudo selectors like &:hover)
        if (prop.value && prop.value.type === 'ObjectExpression') {
          checkObjectForDebug(prop.value)
        }
      })
    }

    return {
      // Handle JSX debug attribute directly on Panda components
      'JSXAttribute[name.name="debug"]'(node: TSESTree.JSXAttribute) {
        if (!isPandaProp(node, context)) return

        context.report({
          node,
          messageId: 'debug',
          suggest: [
            {
              messageId: 'prop',
              fix: (fixer) => fixer.remove(node),
            },
          ],
        })
      },

      // Handle JSX attributes with object values (_hover, css, etc.)
      JSXAttribute(node: TSESTree.JSXAttribute) {
        if (!isPandaProp(node, context)) return

        // Skip non-object values
        if (!node.value || !isJSXExpressionContainer(node.value)) return
        const expr = node.value.expression
        if (!isObjectExpression(expr)) return

        // Check for debug in the object
        checkObjectForDebug(expr)
      },

      // Handle debug property in objects (css, styled, etc.)
      'Property[key.name="debug"]'(node: TSESTree.Property) {
        // Skip if already processed
        if (processedNodes.has(node)) return

        // Ensure the property is a Panda attribute
        if (!isPandaAttribute(node, context)) return
        // Exclude recipe variants
        if (isRecipeVariant(node, context)) return

        processedNodes.add(node)

        context.report({
          node: node.key,
          messageId: 'debug',
          suggest: [
            {
              messageId: 'property',
              fix: (fixer) => fixer.removeRange([node.range[0], node.range[1] + 1]),
            },
          ],
        })
      },
    }
  },
})

export default rule
