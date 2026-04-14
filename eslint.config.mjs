import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import vueParser from 'vue-eslint-parser'
import vuePlugin from 'eslint-plugin-vue'

export default [
  {
    ignores: ['.nuxt/**', '.output/**', 'node_modules/**', 'dist/**'],
  },
  js.configs.recommended,
  ...vuePlugin.configs['flat/recommended'],
  {
    files: ['**/*.{ts,tsx,vue,mjs}'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/attributes-order': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
    },
  },
]
