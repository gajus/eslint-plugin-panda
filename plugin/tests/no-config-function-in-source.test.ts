import { eslintTester } from '../test-utils'
import rule, { RULE_NAME } from '../src/rules/no-config-function-in-source'
import multiLine from 'multiline-ts'

eslintTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: multiLine`
        import { defineConfig, defineKeyframes } from '@pandacss/dev';
        
        const keyframes = defineKeyframes({
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
        });
        
        export default defineConfig({
          theme: {
            keyframes
          }
        });
      `,
      filename: 'panda.config.ts',
    },
  ],
  invalid: [
    {
      code: multiLine`
        import {  defineKeyframes } from '@pandacss/dev';
        import { css } from './panda/css';
        
        const keyframes = defineKeyframes({
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
        });
        
        const styles = css({
          animation: 'fadeIn 1s ease-in-out',
        });
      `,
      filename: 'App.tsx',
      errors: [{
        messageId: 'configFunction',
        suggestions: [ {
          messageId: 'delete',
          output: multiLine`
            import {   } from '@pandacss/dev';
            import { css } from './panda/css';
            
            
            
            const styles = css({
              animation: 'fadeIn 1s ease-in-out',
            });
          `
        }]
      }],
    },
  ],
})
