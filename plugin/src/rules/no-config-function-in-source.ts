import { createRule } from '../utils'
import { getAncestor, getImportSpecifiers, hasPkgImport, isPandaConfigFunction, isValidFile } from '../utils/helpers'
import { isIdentifier, isVariableDeclaration } from '../utils/nodes'
import { type TSESTree } from '@typescript-eslint/utils'

export const RULE_NAME = 'no-config-function-in-source'

const CONFIG_FUNCTIONS = new Set([
  'defineConfig',
  'defineGlobalStyles',
  'defineKeyframes',
  'defineLayerStyles',
  'defineParts',
  'definePattern',
  'definePreset',
  'defineRecipe',
  'defineSemanticTokens',
  'defineSlotRecipe',
  'defineStyles',
  'defineTextStyles',
  'defineTokens',
  'defineUtility',
])

const rule = createRule({
  create(context) {
    // Check if the package is imported; if not, exit early
    if (!hasPkgImport(context)) {
      return {}
    }

    // Determine if the current file is the Panda config file
    const isPandaFile = isValidFile(context)

    // If we are in the config file, no need to proceed
    if (!isPandaFile) {
      return {}
    }

    return {
      CallExpression(node: TSESTree.CallExpression) {
        // Ensure the callee is an identifier
        if (!isIdentifier(node.callee)) {
          return
        }

        const functionName = node.callee.name

        // Check if the function is a config function
        if (!CONFIG_FUNCTIONS.has(functionName)) {
          return
        }

        // Verify that it's a Panda config function
        if (!isPandaConfigFunction(context, functionName)) {
          return
        }

        context.report({
          data: {
            name: functionName,
          },
          messageId: 'configFunction',
          node,
          suggest: [
            {
              data: {
                name: functionName,
              },
              fix(fixer) {
                const declaration = getAncestor(isVariableDeclaration, node)
                const importSpecifiers = getImportSpecifiers(context)

                // Find the import specifier for the function
                const importSpec = importSpecifiers.find((s) => s.specifier.local.name === functionName)

                const fixes = []

                // Remove the variable declaration if it exists; otherwise, remove the call expression
                if (declaration) {
                  fixes.push(fixer.remove(declaration))
                } else {
                  fixes.push(fixer.remove(node))
                }

                // Remove the import specifier if it exists
                if (importSpec?.specifier) {
                  fixes.push(fixer.remove(importSpec.specifier))
                }

                return fixes
              },
              messageId: 'delete',
            },
          ],
        })
      },
    }
  },
  defaultOptions: [],
  meta: {
    docs: {
      description: 'Prohibit the use of config functions outside the Panda config file.',
    },
    hasSuggestions: true,
    messages: {
      configFunction: 'Unnecessary `{{name}}` call. Config functions should only be used in the Panda config file.',
      delete: 'Delete `{{name}}` call.',
    },
    schema: [],
    type: 'problem',
  },
  name: RULE_NAME,
})

export default rule
