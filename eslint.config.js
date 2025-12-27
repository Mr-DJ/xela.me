const js = require('@eslint/js')
const prettier = require('eslint-plugin-prettier')
const nextPlugin = require('eslint-config-next/core-web-vitals')
const prettierConfig = require('eslint-config-prettier')

module.exports = [
  js.configs.recommended,
  ...nextPlugin,
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      prettier: prettier,
    },
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
      'react/react-in-jsx-scope': 'off',
      'jsx-a11y/anchor-is-valid': [
        'error',
        {
          components: ['Link'],
          specialLink: ['hrefLeft', 'hrefRight'],
          aspects: ['invalidHref', 'preferButton'],
        },
      ],
      'react/prop-types': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'react/no-unescaped-entities': 'off',
      '@next/next/no-document-import-in-page': 'off',
    },
  },
  {
    // MDX bundler requires creating components dynamically from source
    // This is the required pattern and cannot be avoided
    files: ['components/MDXComponents.js'],
    rules: {
      'react-hooks/static-components': 'off',
    },
  },
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'public/**',
      '*.config.js',
      'scripts/**',
    ],
  },
]
