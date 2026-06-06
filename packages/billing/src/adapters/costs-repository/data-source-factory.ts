import { DataSource } from 'typeorm';

import { AccountEntity } from '../accounts-repository/account-entity.js';

import { CostEntryEntity } from './cost-entry-entity.js';

export function createDataSource(dbPath: string): DataSource {
  return new DataSource({
    type: 'better-sqlite3',
    database: dbPath,
    entities: [CostEntryEntity, AccountEntity],
    synchronize: true,
  });
}
