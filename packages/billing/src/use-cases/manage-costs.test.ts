import { describe, it, expect, beforeEach, vi } from 'vitest';

import type { CostEntry, FetchCostsOptions } from '../domain/index.js';
import type { ToFetchCosts } from '../ports/index.js';
import type { ToPersistCosts } from '../ports/index.js';

import { ManageCosts } from './manage-costs.js';

const makeEntry = (overrides: Partial<CostEntry> = {}): CostEntry => ({
  accountId: 'acc-1',
  resourceInstanceId: 'crn:v1::instance',
  resourceId: 'cos',
  planId: 'standard',
  cost: 5.0,
  currency: 'USD',
  month: '2026-01',
  ...overrides,
});

const makeFetcher = (entries: CostEntry[] = []): ToFetchCosts => ({
  fetch: vi.fn().mockResolvedValue(entries),
});

const makeStore = (): ToPersistCosts => ({
  save: vi.fn().mockResolvedValue(undefined),
  findByMonth: vi.fn().mockResolvedValue([]),
  findAll: vi.fn().mockResolvedValue([]),
});

const options: FetchCostsOptions = { accountId: 'acc-1', month: '2026-01', apiKey: 'key' };

describe('ManageCosts', () => {
  let fetcher: ToFetchCosts;
  let store: ToPersistCosts;
  let useCase: ManageCosts;

  beforeEach(() => {
    fetcher = makeFetcher([makeEntry()]);
    store = makeStore();
    useCase = new ManageCosts(fetcher, store);
  });

  it('fetches from the cloud with the given options', async () => {
    await useCase.fetchCosts(options);

    expect(fetcher.fetch).toHaveBeenCalledWith(options);
  });

  it('persists the raw fetched entries before aggregating', async () => {
    const entries = [makeEntry(), makeEntry({ cost: 10.0 })];
    useCase = new ManageCosts(makeFetcher(entries), store);

    await useCase.fetchCosts(options);

    expect(store.save).toHaveBeenCalledWith(entries);
  });

  it('returns entries aggregated by resourceName', async () => {
    const entries = [
      makeEntry({ resourceName: 'COS', cost: 5.0 }),
      makeEntry({ resourceName: 'COS', cost: 3.0 }),
      makeEntry({ resourceName: 'VPC', cost: 7.0 }),
    ];
    useCase = new ManageCosts(makeFetcher(entries), store);

    const result = await useCase.fetchCosts(options);

    expect(result).toHaveLength(2);
    const cos = result.find((r) => r.resourceName === 'COS');
    expect(cos?.cost).toBeCloseTo(8.0);
    const vpc = result.find((r) => r.resourceName === 'VPC');
    expect(vpc?.cost).toBeCloseTo(7.0);
  });

  it('aggregates separately for different months', async () => {
    const entries = [
      makeEntry({ resourceName: 'COS', month: '2026-01', cost: 5.0 }),
      makeEntry({ resourceName: 'COS', month: '2026-02', cost: 3.0 }),
    ];
    useCase = new ManageCosts(makeFetcher(entries), store);

    const result = await useCase.fetchCosts(options);

    expect(result).toHaveLength(2);
  });

  it('aggregates separately for different accounts', async () => {
    const entries = [
      makeEntry({ accountId: 'acc-1', resourceName: 'COS', cost: 5.0 }),
      makeEntry({ accountId: 'acc-2', resourceName: 'COS', cost: 3.0 }),
    ];
    useCase = new ManageCosts(makeFetcher(entries), store);

    const result = await useCase.fetchCosts(options);

    expect(result).toHaveLength(2);
  });

  it('returns an empty array when the fetcher returns nothing', async () => {
    useCase = new ManageCosts(makeFetcher([]), store);

    const result = await useCase.fetchCosts(options);

    expect(result).toHaveLength(0);
  });

  it('result entries only contain the ResourceCostEntry fields', async () => {
    const entries = [makeEntry({ resourceName: 'COS', cost: 5.0 })];
    useCase = new ManageCosts(makeFetcher(entries), store);

    const result = await useCase.fetchCosts(options);

    expect(result[0]).toEqual({
      accountId: 'acc-1', resourceName: 'COS', cost: 5.0, currency: 'USD', month: '2026-01',
    });
    expect(result[0]).not.toHaveProperty('resourceInstanceId');
    expect(result[0]).not.toHaveProperty('planId');
  });
});
