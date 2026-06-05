import UsageReportsV4 from '@ibm-cloud/platform-services/usage-reports/v4.js'
import { IamAuthenticator } from 'ibm-cloud-sdk-core'
import type { CostEntry } from './types/cost-entry.js'
import type { FetchCostsOptions } from './types/fetch-costs-options.js'
import { mapInstanceUsageToCostEntry } from './mappers/usage-response-to-cost-entries.js'

export class CostsFetcher {
  async fetch(options: FetchCostsOptions): Promise<CostEntry[]> {
    const client = new UsageReportsV4({
      authenticator: new IamAuthenticator({ apikey: options.apiKey }),
    })

    const pager = new UsageReportsV4.GetResourceUsageAccountPager(client, {
      accountId: options.accountId,
      billingmonth: options.month,
      names: true,
      limit: 200,
    })

    const instances = await pager.getAll()

    return instances.map(mapInstanceUsageToCostEntry)
  }
}
