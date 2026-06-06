import tseslint from 'typescript-eslint';

import baseConfig from './base.js';

export default tseslint.config(
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },
);
