import baseConfig from '@chriswa/ts-config/eslint'
import globals from 'globals'

export default [
  ...baseConfig,
  {
    languageOptions: {
      globals: globals.browser
    },
    rules: {
      // Require curly braces for all control statements (auto-fixable)
      curly: ['error', 'all']
    }
  }
]
