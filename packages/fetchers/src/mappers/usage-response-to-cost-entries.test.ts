import { describe, it, expect } from 'vitest'
import { mapInstanceUsageToCostEntry } from './usage-response-to-cost-entries.js'
import type UsageReportsV4 from '@ibm-cloud/platform-services/usage-reports/v4.js'

const baseInstance: UsageReportsV4.InstanceUsage = {
  account_id: 'acc-1',
  resource_instance_id: 'crn:v1:bluemix:cos:us-south:a/abc::',
  resource_instance_name: 'My COS instance',
  resource_id: 'cloud-object-storage',
  resource_name: 'Cloud Object Storage',
  plan_id: 'standard',
  plan_name: 'Standard',
  region: 'us-south',
  resource_group_id: 'rg-1',
  resource_group_name: 'Default',
  pricing_country: 'USA',
  currency_code: 'USD',
  billable: true,
  month: '2026-01',
  usage: [
    { metric: 'STORAGE', cost: 5.0, rated_cost: 5.0, quantity: 100, discounts: [] },
    { metric: 'BANDWIDTH', cost: 3.0, rated_cost: 3.0, quantity: 50, discounts: [] },
  ],
}

describe('mapInstanceUsageToCostEntry', () => {
  it('maps all fields from an InstanceUsage to a CostEntry', () => {
    const entry = mapInstanceUsageToCostEntry(baseInstance)

    expect(entry).toEqual({
      accountId: 'acc-1',
      resourceInstanceId: 'crn:v1:bluemix:cos:us-south:a/abc::',
      resourceInstanceName: 'My COS instance',
      resourceId: 'cloud-object-storage',
      resourceName: 'Cloud Object Storage',
      planId: 'standard',
      planName: 'Standard',
      region: 'us-south',
      resourceGroupId: 'rg-1',
      resourceGroupName: 'Default',
      cost: 8.0,
      currency: 'USD',
      month: '2026-01',
    })
  })

  it('sums only chargeable metrics', () => {
    const instance: UsageReportsV4.InstanceUsage = {
      ...baseInstance,
      usage: [
        { metric: 'STORAGE', cost: 5.0, rated_cost: 5.0, quantity: 100, discounts: [] },
        { metric: 'FREE_TIER', cost: 2.0, rated_cost: 2.0, quantity: 10, non_chargeable: true, discounts: [] },
      ],
    }

    const entry = mapInstanceUsageToCostEntry(instance)

    expect(entry.cost).toBe(5.0)
  })

  it('returns cost of 0 when all metrics are non-chargeable', () => {
    const instance: UsageReportsV4.InstanceUsage = {
      ...baseInstance,
      usage: [
        { metric: 'FREE', cost: 99.0, rated_cost: 99.0, quantity: 1, non_chargeable: true, discounts: [] },
      ],
    }

    expect(mapInstanceUsageToCostEntry(instance).cost).toBe(0)
  })

  it('throws when currency is not USD', () => {
    const instance = { ...baseInstance, currency_code: 'EUR' }

    expect(() => mapInstanceUsageToCostEntry(instance)).toThrow('Unsupported currency: EUR')
  })

  it('handles optional fields being absent', () => {
    const { resource_instance_name, resource_name, plan_name, region, resource_group_id, resource_group_name, ...rest } = baseInstance
    const entry = mapInstanceUsageToCostEntry(rest as UsageReportsV4.InstanceUsage)

    expect(entry.resourceInstanceName).toBeUndefined()
    expect(entry.resourceName).toBeUndefined()
    expect(entry.planName).toBeUndefined()
    expect(entry.region).toBeUndefined()
    expect(entry.resourceGroupId).toBeUndefined()
    expect(entry.resourceGroupName).toBeUndefined()
  })
})
