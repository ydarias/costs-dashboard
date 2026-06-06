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

  it('persists the fetched entries', async () => {
    const entries = [makeEntry(), makeEntry({ cost: 10.0 })];
    fetcher = makeFetcher(entries);
    useCase = new ManageCosts(fetcher, store);

    await useCase.fetchCosts(options);

    expect(store.save).toHaveBeenCalledWith(entries);
  });

  it('returns the fetched entries as ResourceCostEntry[]', async () => {
    const entries = [makeEntry({ cost: 7.5 })];
    fetcher = makeFetcher(entries);
    useCase = new ManageCosts(fetcher, store);

    const result = await useCase.fetchCosts(options);

    expect(result).toEqual(entries);
  });

  it('returns an empty array when the fetcher returns nothing', async () => {
    fetcher = makeFetcher([]);
    useCase = new ManageCosts(fetcher, store);

    const result = await useCase.fetchCosts(options);

    expect(result).toHaveLength(0);
    expect(store.save).toHaveBeenCalledWith([]);
  });
});
