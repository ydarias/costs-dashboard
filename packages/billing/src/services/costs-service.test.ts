import { describe, it, expect, beforeEach, vi } from 'vitest';

import type { CostEntry, FetchCostsOptions } from '../domain/index.js';
import type { ToFetchCosts, ToPersistAccounts } from '../ports/index.js';
import type { ToPersistCosts } from '../ports/index.js';

import { CostsService } from './costs-service';

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

const makeAccountsStore = (): ToPersistAccounts => ({
  save: vi.fn().mockResolvedValue(undefined),
});

const options: FetchCostsOptions = { accountId: 'acc-1', accountName: 'Acc One', month: '2026-01', apiKey: 'key' };

describe('ManageCosts', () => {
  let fetcher: ToFetchCosts;
  let store: ToPersistCosts;
  let accountsStore: ToPersistAccounts;
  let useCase: CostsService;

  beforeEach(() => {
    fetcher = makeFetcher([makeEntry()]);
    store = makeStore();
    accountsStore = makeAccountsStore();
    useCase = new CostsService(fetcher, store, accountsStore);
  });

  it('fetches from the cloud with the given options', async () => {
    await useCase.fetchCosts(options);

    expect(fetcher.fetch).toHaveBeenCalledWith(options);
  });

  it('saves the account before fetching costs', async () => {
    await useCase.fetchCosts(options);

    expect(accountsStore.save).toHaveBeenCalledWith({ id: 'acc-1', name: 'Acc One' });
  });

  it('persists the raw fetched entries before aggregating', async () => {
    const entries = [makeEntry(), makeEntry({ cost: 10.0 })];
    useCase = new CostsService(makeFetcher(entries), store, accountsStore);

    await useCase.fetchCosts(options);

    expect(store.save).toHaveBeenCalledWith(entries);
  });

  it('returns entries aggregated by resourceName', async () => {
    const entries = [
      makeEntry({ resourceName: 'COS', cost: 5.0 }),
      makeEntry({ resourceName: 'COS', cost: 3.0 }),
      makeEntry({ resourceName: 'VPC', cost: 7.0 }),
    ];
    useCase = new CostsService(makeFetcher(entries), store, accountsStore);

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
    useCase = new CostsService(makeFetcher(entries), store, accountsStore);

    const result = await useCase.fetchCosts(options);

    expect(result).toHaveLength(2);
  });

  it('aggregates separately for different accounts', async () => {
    const entries = [
      makeEntry({ accountId: 'acc-1', resourceName: 'COS', cost: 5.0 }),
      makeEntry({ accountId: 'acc-2', resourceName: 'COS', cost: 3.0 }),
    ];
    useCase = new CostsService(makeFetcher(entries), store, accountsStore);

    const result = await useCase.fetchCosts(options);

    expect(result).toHaveLength(2);
  });

  it('returns an empty array when the fetcher returns nothing', async () => {
    useCase = new CostsService(makeFetcher([]), store, accountsStore);

    const result = await useCase.fetchCosts(options);

    expect(result).toHaveLength(0);
  });

  it('result entries only contain the ResourceCostEntry fields', async () => {
    const entries = [makeEntry({ resourceName: 'COS', cost: 5.0 })];
    useCase = new CostsService(makeFetcher(entries), store, accountsStore);

    const result = await useCase.fetchCosts(options);

    expect(result[0]).toEqual({
      accountId: 'acc-1', resourceName: 'COS', cost: 5.0, currency: 'USD', month: '2026-01',
    });
    expect(result[0]).not.toHaveProperty('resourceInstanceId');
    expect(result[0]).not.toHaveProperty('planId');
  });
});
