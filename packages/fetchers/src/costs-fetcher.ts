import type { CostEntry } from '@costs/domain';
import UsageReportsV4 from '@ibm-cloud/platform-services/usage-reports/v4.js';
import { IamAuthenticator } from 'ibm-cloud-sdk-core';

import { mapInstanceUsageToCostEntry } from './mappers/usage-response-to-cost-entries.js';
import type { FetchCostsOptions } from './types/fetch-costs-options.js';

export class CostsFetcher {
  async fetch(options: FetchCostsOptions): Promise<CostEntry[]> {
    const client = new UsageReportsV4({
      authenticator: new IamAuthenticator({ apikey: options.apiKey }),
    });

    const pager = new UsageReportsV4.GetResourceUsageAccountPager(client, {
      accountId: options.accountId,
      billingmonth: options.month,
      names: true,
      limit: 200,
    });

    const instances = await pager.getAll();

    return instances.map(mapInstanceUsageToCostEntry);
  }
}
