import { describe, it, expect } from 'vitest'
import { mapResourceToCostEntry } from './usage-response-to-cost-entries.js'
import type UsageReportsV4 from '@ibm-cloud/platform-services/usage-reports/v4.js'

const baseResource: UsageReportsV4.Resource = {
  resource_id: 'cloud-object-storage',
  resource_name: 'Cloud Object Storage',
  billable_cost: 12.34,
  billable_rated_cost: 12.34,
  non_billable_cost: 0,
  non_billable_rated_cost: 0,
  plans: [],
  discounts: [],
}

describe('mapResourceToCostEntry', () => {
  it('maps a USD resource to a CostEntry', () => {
    const entry = mapResourceToCostEntry(baseResource, 'acc-1', '2026-01', 'USD')

    expect(entry).toEqual({
      accountId: 'acc-1',
      resourceId: 'cloud-object-storage',
      resourceName: 'Cloud Object Storage',
      cost: 12.34,
      currency: 'USD',
      month: '2026-01',
    })
  })

  it('falls back to resource_id when resource_name is absent', () => {
    const resource = { ...baseResource, resource_name: undefined }
    const entry = mapResourceToCostEntry(resource, 'acc-1', '2026-01', 'USD')

    expect(entry.resourceName).toBe('cloud-object-storage')
  })

  it('throws when currency is not USD', () => {
    expect(() => mapResourceToCostEntry(baseResource, 'acc-1', '2026-01', 'EUR')).toThrow(
      'Unsupported currency: EUR',
    )
  })
})
