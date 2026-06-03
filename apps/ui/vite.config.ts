import react from '@vitejs/plugin-react'
import { createVitestConfig } from '@costs/vitest-config'

export default createVitestConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
})
