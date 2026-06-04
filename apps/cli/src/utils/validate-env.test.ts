import { describe, it, expect, vi, afterEach } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('validateEnv', () => {
  it('returns apiKey and accountIds when both env vars are set', async () => {
    vi.stubEnv('IBM_CLOUD_API_KEY', 'my-key')
    vi.stubEnv('IBM_CLOUD_ACCOUNT_IDS', 'acc-1, acc-2')

    const { validateEnv } = await import('./validate-env.js')
    const result = validateEnv()

    expect(result.apiKey).toBe('my-key')
    expect(result.accountIds).toEqual(['acc-1', 'acc-2'])
  })

  it('calls process.exit(1) when IBM_CLOUD_API_KEY is missing', async () => {
    vi.stubEnv('IBM_CLOUD_API_KEY', '')
    vi.stubEnv('IBM_CLOUD_ACCOUNT_IDS', 'acc-1')
    const exit = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit called')
    }) as never)

    const { validateEnv } = await import('./validate-env.js')
    expect(() => validateEnv()).toThrow('process.exit called')
    expect(exit).toHaveBeenCalledWith(1)
  })

  it('calls process.exit(1) when IBM_CLOUD_ACCOUNT_IDS is missing', async () => {
    vi.stubEnv('IBM_CLOUD_API_KEY', 'my-key')
    vi.stubEnv('IBM_CLOUD_ACCOUNT_IDS', '')
    const exit = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit called')
    }) as never)

    const { validateEnv } = await import('./validate-env.js')
    expect(() => validateEnv()).toThrow('process.exit called')
    expect(exit).toHaveBeenCalledWith(1)
  })
})
