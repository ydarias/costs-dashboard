import type { CostEntry } from '@costs/fetchers'

export type { CostEntry }

export interface CostRepository {
  save(entries: CostEntry[]): Promise<void>
  findByMonth(month: string): Promise<CostEntry[]>
  findAll(): Promise<CostEntry[]>
}

export { SqliteCostRepository } from './sqlite-cost-repository.js'
export { createDataSource } from './data-source.js'
