import type {DataSource, Repository} from 'typeorm'
import type {CostEntry} from '@costs/domain'
import {CostEntryEntity} from './entities/cost-entry-entity.js'
import {CostRepository} from "./cost-repository.js";
import {toCostEntry} from "./mappers/to-cost-entry";
import {toCostEntryEntity} from "./mappers/to-cost-entry-entity";

// TODO probably is totally fine as DB repository for other engines
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
        entries.map(toCostEntryEntity),
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

