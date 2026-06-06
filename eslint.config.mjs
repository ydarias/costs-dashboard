import nodeConfig from '@costs/eslint-config/node';

export default [
  { ignores: ['**/dist/**', '**/node_modules/**'] },
  ...nodeConfig,
];
