module.exports = {
  root: true,
  parserOptions: {
    parser: '@babel/eslint-parser',
    ecmaVersion: 8,
    ecmaFeatures: {
      impliedStrict: true
    },
    sourceType: 'module'
  },
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: [
    'standard',
    'eslint:recommended',
    'plugin:vue/base',
    'plugin:import/errors',
    'plugin:import/warnings'
  ],
  globals: {
    __static: true,
    defineProps: 'readonly'
  },
  plugins: ['html', 'vue'],
  rules: {
    // allow paren-less arrow functions
    'arrow-parens': 'off',
    // allow async-await
    'generator-star-spacing': 'off',
    // allow console
    'no-console': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-return-assign': 'warn',
    'no-new': 'warn',
    // disallow semicolons
    semi: [2, 'never'],
    'require-atomic-updates': 'off',
    // TODO: fix these errors someday
    'prefer-const': 'off',
    'no-new': 'off',
    'no-mixed-operators': 'off',
    'no-prototype-builtins': 'off',
    'no-return-await': 'off',
    'accessor-pairs': 'off',
    // Workaround #2422.
    'template-curly-spacing': 'off',
    indent: 'off',
    // Allow Vite-specific import queries (?inline, ?raw)
    'import/no-unresolved': ['error', {
      ignore: ['\\?inline$', '\\?raw$']
    }],
    // Allow unused vars that start with underscore
    'no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }]
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.vue', '.json', '.css', '.node']
      },
      alias: {
        map: [
          ['common', './src/common'],
          // Normally only valid for renderer/
          ['@', './src/renderer'],
          ['muya', './src/muya']
        ],
        extensions: ['.js', '.vue', '.json', '.css', '.node']
      }
    }
  },
  ignorePatterns: [
    'node_modules',
    'src/muya/dist/**/*',
    'src/muya/vite.config.js'
  ]
}
