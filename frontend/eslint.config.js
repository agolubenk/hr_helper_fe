import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

/**
 * FSD Layer Import Rules:
 * 
 * Иерархия слоёв (сверху вниз):
 * 1. app/       - может импортировать из всех слоёв
 * 2. processes/ - может импортировать из pages, widgets, features, entities, shared
 * 3. pages/     - может импортировать из widgets, features, entities, shared
 * 4. widgets/   - может импортировать из features, entities, shared
 * 5. features/  - может импортировать из entities, shared
 * 6. entities/  - может импортировать только из shared
 * 7. shared/    - не может импортировать из других слоёв
 * 
 * Текущая структура проекта использует адаптированный FSD:
 * - app/      → features/, entities/, shared/
 * - features/ → entities/, shared/
 * - entities/ → shared/
 * - shared/   → (ничего из других слоёв)
 */

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['dist/**', 'node_modules/**', 'eslint.config.js', '**/*.test.ts', '**/*.test.tsx'],
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'no-empty': 'off',
      'prefer-const': 'off',
      'no-useless-escape': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  // FSD: shared/ layer - не может импортировать из app/, features/, entities/
  {
    files: ['src/shared/**/*.ts', 'src/shared/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app/*', '@/features/*', '@/entities/*'],
              message: 'shared/ layer cannot import from app/, features/, or entities/ layers (FSD rule)',
            },
          ],
        },
      ],
    },
  },
  // FSD: entities/ layer - может импортировать только из shared/
  {
    files: ['src/entities/**/*.ts', 'src/entities/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app/*', '@/features/*'],
              message: 'entities/ layer cannot import from app/ or features/ layers (FSD rule)',
            },
          ],
        },
      ],
    },
  },
  // FSD: features/ layer - может импортировать из entities/ и shared/
  {
    files: ['src/features/**/*.ts', 'src/features/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app/*'],
              message: 'features/ layer cannot import from app/ layer (FSD rule)',
            },
          ],
        },
      ],
    },
  }
)

