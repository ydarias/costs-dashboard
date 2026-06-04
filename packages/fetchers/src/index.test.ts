import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchCosts } from './index.js'

const mockGetAccountUsage = vi.fn()

vi.mock('@ibm-cloud/platform-services/usage-reports/v4.js', () => {
  return {
    default: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
      this.getAccountUsage = mockGetAccountUsage
    }),
  }
})

vi.mock('ibm-cloud-sdk-core', () => ({
  IamAuthenticator: vi.fn(),
}))

describe('fetchCosts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls getAccountUsage with correct params', async () => {
    mockGetAccountUsage.mockResolvedValue({
      result: { resources: [], currency_code: 'USD' },
    })

    await fetchCosts({ accountId: 'acc-1', month: '2026-01', apiKey: 'key' })

    expect(mockGetAccountUsage).toHaveBeenCalledWith({
      accountId: 'acc-1',
      billingmonth: '2026-01',
    })
  })

  it('returns mapped CostEntry array from the response', async () => {
    mockGetAccountUsage.mockResolvedValue({
      result: {
        currency_code: 'USD',
        resources: [
          {
            resource_id: 'cos',
            resource_name: 'Cloud Object Storage',
            billable_cost: 5.0,
            billable_rated_cost: 5.0,
            non_billable_cost: 0,
            non_billable_rated_cost: 0,
            plans: [],
            discounts: [],
          },
        ],
      },
    })

    const entries = await fetchCosts({ accountId: 'acc-1', month: '2026-01', apiKey: 'key' })

    expect(entries).toHaveLength(1)
    expect(entries[0]).toMatchObject({
      accountId: 'acc-1',
      resourceId: 'cos',
      resourceName: 'Cloud Object Storage',
      cost: 5.0,
      currency: 'USD',
      month: '2026-01',
    })
  })

  it('throws when the response contains a non-USD currency', async () => {
    mockGetAccountUsage.mockResolvedValue({
      result: {
        currency_code: 'EUR',
        resources: [
          {
            resource_id: 'cos',
            billable_cost: 5.0,
            billable_rated_cost: 5.0,
            non_billable_cost: 0,
            non_billable_rated_cost: 0,
            plans: [],
            discounts: [],
          },
        ],
      },
    })

    await expect(fetchCosts({ accountId: 'acc-1', month: '2026-01', apiKey: 'key' })).rejects.toThrow(
      'Unsupported currency: EUR',
    )
  })
})
