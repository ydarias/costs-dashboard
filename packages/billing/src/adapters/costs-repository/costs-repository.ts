import type { DataSource, Repository } from 'typeorm';

import type { CostEntry } from '../../domain/index.js';
import type { ToPersistCosts } from '../../ports/index.js';

import { CostEntryEntity } from './cost-entry-entity.js';
import { toCostEntryEntity } from './to-cost-entry-entity.js';
import { toCostEntry } from './to-cost-entry.js';

export class CostsRepository implements ToPersistCosts {
  private readonly repo: Repository<CostEntryEntity>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(CostEntryEntity);
  }

  async save(entries: CostEntry[]): Promise<void> {
    if (entries.length === 0) return;

    const pairs = [...new Set(entries.map((e) => `${e.accountId}::${e.month}`))];

    await this.repo.manager.transaction(async (manager) => {
      for (const pair of pairs) {
        const [accountId, month] = pair.split('::');
        await manager.delete(CostEntryEntity, { accountId, month });
      }
      await manager.save(CostEntryEntity, entries.map(toCostEntryEntity));
    });
  }

  async findByMonth(month: string): Promise<CostEntry[]> {
    const entities = await this.repo.findBy({ month });
    return entities.map(toCostEntry);
  }

  async findAll(): Promise<CostEntry[]> {
    const entities = await this.repo.find();
    return entities.map(toCostEntry);
  }
}
