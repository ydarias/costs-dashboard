import { DataSource } from 'typeorm'
import { CostEntryEntity } from './entities/cost-entry-entity.js'

export function createDataSource(dbPath: string): DataSource {
  return new DataSource({
    type: 'better-sqlite3',
    database: dbPath,
    entities: [CostEntryEntity],
    synchronize: true,
  })
}
