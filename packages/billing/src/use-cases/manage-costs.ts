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
    return entries;
  }
}
