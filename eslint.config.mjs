import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * ESLint flat config for apexline-desktop (Electron + Vite + TypeScript).
 *
 * Three Electron processes mapped to scopes:
 *   - main:     src/main.ts          → Node globals
 *   - preload:  src/preload.ts       → Node + browser globals
 *   - renderer: src/renderer.ts + UI → browser globals
 *
 * Conventions inherited from apexline-ts-skeleton:
 *   - `no-restricted-imports` forbids `../*` (use `@/` alias)
 *   - type-only imports enforced
 *   - reportUnusedDisableDirectives on
 */
export default tseslint.config(
  {
    ignores: [
      '.vite/**',
      'out/**',
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'src/route-tree.gen.ts',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.es2022,
        ...globals.node,
      },
      parser: tseslint.parser,
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'no-unused-vars': 'off',
      'no-undef': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*', '../../*', '../../../*'],
              message:
                'Relative imports outside current directory are prohibited. Use @/ alias.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/preload.ts', 'src/renderer.ts', 'src/renderer/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
);
