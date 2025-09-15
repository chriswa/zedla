import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import'
import promise from 'eslint-plugin-promise'
import unicorn from 'eslint-plugin-unicorn'
import regexp from 'eslint-plugin-regexp'
import globals from 'globals'
import stylistic from '@stylistic/eslint-plugin'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

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
    settings: {
      // Ensure eslint-plugin-import resolves TS path aliases (e.g., '@/...')
      'import/resolver': {
        typescript: {
          project: ['./tsconfig.json'],
        },
      },
    },
    plugins: { import: importPlugin, promise, unicorn, regexp, stylistic, 'simple-import-sort': simpleImportSort },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      // Stylistic formatting (preserves manual wrapping; no Prettier)
      stylistic.configs.customize({
        indent: 2,
        quotes: 'single',
        semi: false,
        jsx: true,
        commaDangle: 'always-multiline',
      }),
    ],
    rules: {
      // --- Core correctness
      eqeqeq: ['error', 'smart'],
      'no-implicit-coercion': ['error', { allow: ['!!'] }],
      'no-constant-binary-expression': 'error',
      'no-else-return': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // --- TypeScript safety
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'no-type-imports', fixStyle: 'separate-type-imports' },
      ],
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
      '@typescript-eslint/prefer-literal-enum-member': ['error', { allowBitwiseExpressions: true }],

      // --- Imports hygiene
      'import/first': 'error',
      'import/no-duplicates': 'error',
      'import/no-useless-path-segments': 'error',
      // Enforce alias usage via no-restricted-imports; disable this to avoid false positives with aliases
      'import/no-relative-parent-imports': 'off',
      // Disallow all relative imports ('./' and '../'); enforce alias-based imports
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['^\\.'],
              message: 'Use @/ path alias instead of relative import.'
            }
          ]
        }
      ],
      'import/order': 'off',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [['^.+$']],
        },
      ],
      'simple-import-sort/exports': 'error',
      'padding-line-between-statements': [
        'error',
        { blankLine: 'never', prev: 'import', next: 'import' },
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

      // Stylistic: prefer single quotes, no semicolons, trailing commas only on multiline
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/indent': ['error', 2, { SwitchCase: 1 }],
      // No cuddled elses: place `else`/`else if` on a new line (Stroustrup)
      '@stylistic/brace-style': ['error', 'stroustrup', { allowSingleLine: true }],
      // Always require parentheses around arrow function parameters
      '@stylistic/arrow-parens': ['error', 'always'],

      // Do not force multi-line wrapping; let authors decide
      '@stylistic/max-statements-per-line': 'off',
      '@stylistic/array-bracket-newline': 'off',
      '@stylistic/array-element-newline': 'off',
      '@stylistic/object-curly-newline': 'off',
      '@stylistic/object-property-newline': 'off',
      '@stylistic/function-paren-newline': 'off',
      '@stylistic/function-call-argument-newline': 'off',
      '@stylistic/implicit-arrow-linebreak': 'off',
      '@stylistic/operator-linebreak': 'off',
      '@stylistic/multiline-ternary': 'off',
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
)
