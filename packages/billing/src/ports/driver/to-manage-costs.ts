import type { FetchCostsOptions } from '../../domain/index.js';
import type { ResourceCostEntry } from '../../domain/index.js';

export interface ToManageCosts {
  fetchCosts(options: FetchCostsOptions): Promise<ResourceCostEntry[]>;
}
