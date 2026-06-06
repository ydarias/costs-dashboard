import type { CostEntry } from '../../domain/index.js';

export interface ToPersistCosts {
  save(entries: CostEntry[]): Promise<void>;
  findByMonth(month: string): Promise<CostEntry[]>;
  findAll(): Promise<CostEntry[]>;
}
