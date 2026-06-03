import type { CostEntry } from '@costs/fetchers'

export interface CostRepository {
  save(entries: CostEntry[]): Promise<void>
  findByMonth(month: string): Promise<CostEntry[]>
  findAll(): Promise<CostEntry[]>
}
