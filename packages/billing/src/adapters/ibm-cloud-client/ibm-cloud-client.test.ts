import type UsageReportsV4 from '@ibm-cloud/platform-services/usage-reports/v4.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { IbmCloudClient } from './ibm-cloud-client.js';

const mockGetAll = vi.fn();

vi.mock('@ibm-cloud/platform-services/usage-reports/v4.js', () => {
  return {
    default: Object.assign(
      vi.fn().mockImplementation(function (this: Record<string, unknown>) {}),
      {
        GetResourceUsageAccountPager: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
          this.getAll = mockGetAll;
        }),
      },
    ),
  };
});

vi.mock('ibm-cloud-sdk-core', () => ({
  IamAuthenticator: vi.fn(),
}));

const baseInstance: UsageReportsV4.InstanceUsage = {
  account_id: 'acc-1',
  resource_instance_id: 'crn:v1::',
  resource_id: 'cloud-object-storage',
  plan_id: 'standard',
  pricing_country: 'USA',
  currency_code: 'USD',
  billable: true,
  month: '2026-01',
  usage: [{ metric: 'STORAGE', cost: 5.0, rated_cost: 5.0, quantity: 100, discounts: [] }],
};

describe('IbmCloudClient', () => {
  let client: IbmCloudClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new IbmCloudClient();
  });

  it('creates the pager with correct params', async () => {
    mockGetAll.mockResolvedValue([]);
    const UsageReportsV4Mock = (await import('@ibm-cloud/platform-services/usage-reports/v4.js')).default;

    await client.fetch({ accountId: 'acc-1', month: '2026-01', apiKey: 'key' });

    expect(UsageReportsV4Mock.GetResourceUsageAccountPager).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ accountId: 'acc-1', billingmonth: '2026-01', names: true }),
    );
  });

  it('returns mapped CostEntry array', async () => {
    mockGetAll.mockResolvedValue([baseInstance]);

    const entries = await client.fetch({ accountId: 'acc-1', month: '2026-01', apiKey: 'key' });

    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      accountId: 'acc-1',
      resourceInstanceId: 'crn:v1::',
      resourceId: 'cloud-object-storage',
      cost: 5.0,
      currency: 'USD',
      month: '2026-01',
    });
  });

  it('returns an empty array when the pager returns no instances', async () => {
    mockGetAll.mockResolvedValue([]);
    expect(await client.fetch({ accountId: 'acc-1', month: '2026-01', apiKey: 'key' })).toHaveLength(0);
  });

  it('throws when an instance has a non-USD currency', async () => {
    mockGetAll.mockResolvedValue([{ ...baseInstance, currency_code: 'EUR' }]);

    await expect(client.fetch({ accountId: 'acc-1', month: '2026-01', apiKey: 'key' })).rejects.toThrow(
      'Unsupported currency: EUR',
    );
  });
});
