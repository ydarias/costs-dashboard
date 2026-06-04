import type UsageReportsV4 from '@ibm-cloud/platform-services/usage-reports/v4.js'
import type { CostEntry } from '../types/cost-entry.js'

export function mapResourceToCostEntry(
  resource: UsageReportsV4.Resource,
  accountId: string,
  month: string,
  currencyCode: string,
): CostEntry {
  if (currencyCode !== 'USD') {
    throw new Error(`Unsupported currency: ${currencyCode} for resource ${resource.resource_id}`)
  }

  return {
    accountId,
    resourceId: resource.resource_id,
    resourceName: resource.resource_name ?? resource.resource_id,
    cost: resource.billable_cost,
    currency: 'USD',
    month,
  }
}
