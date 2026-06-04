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
          entity.resourceInstanceId = e.resourceInstanceId
          entity.resourceInstanceName = e.resourceInstanceName ?? null
          entity.resourceId = e.resourceId
          entity.resourceName = e.resourceName ?? null
          entity.planId = e.planId
          entity.planName = e.planName ?? null
          entity.region = e.region ?? null
          entity.resourceGroupId = e.resourceGroupId ?? null
          entity.resourceGroupName = e.resourceGroupName ?? null
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
    resourceInstanceId: entity.resourceInstanceId,
    resourceInstanceName: entity.resourceInstanceName ?? undefined,
    resourceId: entity.resourceId,
    resourceName: entity.resourceName ?? undefined,
    planId: entity.planId,
    planName: entity.planName ?? undefined,
    region: entity.region ?? undefined,
    resourceGroupId: entity.resourceGroupId ?? undefined,
    resourceGroupName: entity.resourceGroupName ?? undefined,
    cost: entity.cost,
    currency: 'USD',
    month: entity.month,
  }
}
