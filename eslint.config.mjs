import nextPlugin from '@next/eslint-plugin-next'

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  {
    ignores: ['.next/**', 'out/**', 'node_modules/**'],
  },
  // Use Next's flat configs directly; eslint-config-next pulls typescript-eslint,
  // which does not support TypeScript 7.0 yet.
  nextPlugin.configs.recommended,
  nextPlugin.configs['core-web-vitals'],
]

export default eslintConfig
