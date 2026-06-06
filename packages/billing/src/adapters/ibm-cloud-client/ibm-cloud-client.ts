import type { ToFetchCosts } from '../../ports/index.js';
import type { CostEntry, FetchCostsOptions } from '../../domain/index.js';
import UsageReportsV4 from '@ibm-cloud/platform-services/usage-reports/v4.js';
import { IamAuthenticator } from 'ibm-cloud-sdk-core';

import { mapInstanceUsageToCostEntry } from './usage-response-to-cost-entry.js';

export class IbmCloudClient implements ToFetchCosts {
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
