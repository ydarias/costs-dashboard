import { defineConfig, mergeConfig } from 'vitest/config'

export function createVitestConfig(overrides) {
  return mergeConfig(
    defineConfig({
      test: {
        globals: true,
        passWithNoTests: true,
      },
    }),
    overrides ?? {},
  )
}
