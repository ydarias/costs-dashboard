export type { CostEntry } from './types/cost-entry.js'
export type { FetchCostsOptions } from './types/fetch-costs-options.js'

import UsageReportsV4 from '@ibm-cloud/platform-services/usage-reports/v4.js'
import { IamAuthenticator } from 'ibm-cloud-sdk-core'
import type { CostEntry } from './types/cost-entry.js'
import type { FetchCostsOptions } from './types/fetch-costs-options.js'
import { mapResourceToCostEntry } from './mappers/usage-response-to-cost-entries.js'

export async function fetchCosts(options: FetchCostsOptions): Promise<CostEntry[]> {
  const client = new UsageReportsV4({
    authenticator: new IamAuthenticator({ apikey: options.apiKey }),
  })

  const response = await client.getAccountUsage({
    accountId: options.accountId,
    billingmonth: options.month,
  })

  const { resources, currency_code } = response.result

  return resources.map((resource) =>
    mapResourceToCostEntry(resource, options.accountId, options.month, currency_code),
  )
}
