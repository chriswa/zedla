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
      curly: ['error', 'all'],

      // Disable no-unnecessary-type-parameters due to false positives with constraint-based generics
      //
      // This rule flags type parameters used only once, but fails to recognize that single-use
      // type parameters are often necessary for proper type inference and narrowing. In particular,
      // when a type parameter is used solely to constrain what values can be passed (e.g.,
      // `K extends KeysOfType<T, SomeType>`), it enables TypeScript to capture and narrow the
      // specific literal type being passed, which would be lost if the constraint were inlined.
      //
      // Related issues:
      // - https://github.com/typescript-eslint/typescript-eslint/issues/9751
      //   (inlining single-use parameters can cause compile errors or worse type inference)
      // - https://github.com/typescript-eslint/typescript-eslint/issues/9961
      //   (false positives for class members and return types)
      //
      // Pros of disabling:
      // - Allows legitimate constraint-based generics for type safety
      // - Prevents spurious warnings on utility functions with type narrowing
      // - Matches TypeScript's actual type system capabilities
      //
      // Cons of disabling:
      // - May allow some genuinely unnecessary type parameters to slip through
      // - Developers must manually evaluate whether single-use type parameters are justified
      '@typescript-eslint/no-unnecessary-type-parameters': 'off'
    }
  }
]
