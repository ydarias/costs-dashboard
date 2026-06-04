import type { DataSource, Repository } from 'typeorm'
import type { CostEntry } from '@costs/fetchers'
import type { CostRepository } from './index.js'
import { CostEntryEntity } from './entities/cost-entry-entity.js'

export class SqliteCostRepository implements CostRepository {
  private readonly repo: Repository<CostEntryEntity>

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(CostEntryEntity)
  }

  async save(entries: CostEntry[]): Promise<void> {
    if (entries.length === 0) return

    const pairs = [...new Set(entries.map((e) => `${e.accountId}::${e.month}`))]

    await this.repo.manager.transaction(async (manager) => {
      for (const pair of pairs) {
        const [accountId, month] = pair.split('::')
        await manager.delete(CostEntryEntity, { accountId, month })
      }
      await manager.save(
        CostEntryEntity,
        entries.map((e) => {
          const entity = new CostEntryEntity()
          entity.accountId = e.accountId
          entity.resourceId = e.resourceId
          entity.resourceName = e.resourceName
          entity.cost = e.cost
          entity.currency = e.currency
          entity.month = e.month
          return entity
        }),
      )
    })
  }

  async findByMonth(month: string): Promise<CostEntry[]> {
    const entities = await this.repo.findBy({ month })
    return entities.map(toCostEntry)
  }

  async findAll(): Promise<CostEntry[]> {
    const entities = await this.repo.find()
    return entities.map(toCostEntry)
  }
}

function toCostEntry(entity: CostEntryEntity): CostEntry {
  return {
    accountId: entity.accountId,
    resourceId: entity.resourceId,
    resourceName: entity.resourceName,
    cost: entity.cost,
    currency: 'USD',
    month: entity.month,
  }
}
