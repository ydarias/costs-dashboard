import type { FetchCostsOptions, ResourceCostEntry } from '../domain/index.js';
import type { ToFetchCosts, ToManageCosts, ToPersistCosts } from '../ports/index.js';

export class ManageCosts implements ToManageCosts {
  constructor(
    private readonly fetcher: ToFetchCosts,
    private readonly store: ToPersistCosts,
  ) {}

  async fetchCosts(options: FetchCostsOptions): Promise<ResourceCostEntry[]> {
    const entries = await this.fetcher.fetch(options);
    await this.store.save(entries);
    return this.aggregate(entries);
  }

  private aggregate(entries: Awaited<ReturnType<ToFetchCosts['fetch']>>): ResourceCostEntry[] {
    const groups = new Map<string, ResourceCostEntry>();

    for (const entry of entries) {
      const key = `${entry.accountId}::${entry.resourceName ?? ''}::${entry.month}`;
      const existing = groups.get(key);
      if (existing) {
        existing.cost += entry.cost;
      } else {
        groups.set(key, {
          accountId: entry.accountId,
          resourceName: entry.resourceName,
          cost: entry.cost,
          currency: entry.currency,
          month: entry.month,
        });
      }
    }

    return [...groups.values()];
  }
}
