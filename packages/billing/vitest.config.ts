import { createVitestConfig } from '@costs/vitest-config'

export default createVitestConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
