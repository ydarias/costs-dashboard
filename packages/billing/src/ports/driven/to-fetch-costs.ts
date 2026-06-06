import type { CostEntry } from '../../domain/index.js';
import type { FetchCostsOptions } from '../../domain/index.js';

export interface ToFetchCosts {
  fetch(options: FetchCostsOptions): Promise<CostEntry[]>;
}
