import nodeConfig from '@costs/eslint-config/node';

export default [
  { ignores: ['dist/**'] },
  ...nodeConfig,
];
