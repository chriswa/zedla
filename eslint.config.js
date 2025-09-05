import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import'
import promise from 'eslint-plugin-promise'
import unicorn from 'eslint-plugin-unicorn'
import regexp from 'eslint-plugin-regexp'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

export default tseslint.config(
  // 1) Ignore build artifacts
  { ignores: ['dist', 'coverage', '*.min.*'] },

  // 2) Type-aware TS rules for src
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: { project: ['./tsconfig.json'] }, // enables type-aware rules
      globals: globals.browser,
    },
    plugins: { import: importPlugin, promise, unicorn, regexp },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    rules: {
      // --- Core correctness
      eqeqeq: ['error', 'smart'],
      'no-implicit-coercion': ['error', { allow: ['!!'] }],
      'no-constant-binary-expression': 'error',
      'no-else-return': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // --- TypeScript safety
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/array-type': ['error', { default: 'generic' }],
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
      '@typescript-eslint/no-floating-promises': ['error', { ignoreIIFE: true }],
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
      '@typescript-eslint/promise-function-async': 'error',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true, allowBoolean: false, allowNullish: false, allowAny: false },
      ],
      '@typescript-eslint/no-unnecessary-condition': [
        'error',
        { allowConstantLoopConditions: true },
      ],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-useless-constructor': 'off',
      '@typescript-eslint/no-empty-function': 'off',

      // --- Imports hygiene
      'import/first': 'error',
      'import/no-duplicates': 'error',
      'import/no-useless-path-segments': 'error',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // --- Promise correctness
      '@typescript-eslint/return-await': ['error', 'in-try-catch'],
      'promise/prefer-await-to-then': 'warn',
      'promise/no-return-wrap': 'error',
      'promise/no-new-statics': 'error',
      'promise/no-nesting': 'warn',
      'promise/no-promise-in-callback': 'warn',
      'promise/no-callback-in-promise': 'warn',

      // --- Unicorn: sharp edges
      'unicorn/explicit-length-check': 'error',
      'unicorn/no-array-for-each': 'error',
      'unicorn/no-useless-undefined': 'error',
      'unicorn/prefer-includes': 'error',
      'unicorn/prefer-optional-catch-binding': 'error',
      // Browser app; Node-centric rules off:
      'unicorn/prefer-node-protocol': 'off',
      'unicorn/no-null': 'off',

      // --- RegExp sanity
      'regexp/no-dupe-characters-character-class': 'error',
      'regexp/no-empty-alternative': 'error',

      // pretty
      semi: ['error', 'never'],
      'no-extra-semi': 'error',
    },
  },

  // 3) JS config files (Node env)
  {
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: { globals: globals.node },
  },

  // 4) Tooling files that run in Node even if TS
  {
    files: ['vite.config.*', 'eslint.config.*', 'vitest.config.*'],
    languageOptions: { globals: { ...globals.node, ...globals.es2021 } },
  },

  // 5) Last: disable formatting conflicts
  prettier,
)
