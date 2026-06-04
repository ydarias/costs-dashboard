import 'reflect-metadata'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createDataSource } from './data-source.js'
import { SqliteCostRepository } from './sqlite-cost-repository.js'
import type { DataSource } from 'typeorm'
import type { CostEntry } from '@costs/fetchers'

const entry = (overrides: Partial<CostEntry> = {}): CostEntry => ({
  accountId: 'acc-1',
  resourceInstanceId: 'crn:v1::cos-instance',
  resourceId: 'cos',
  resourceName: 'Cloud Object Storage',
  planId: 'standard',
  cost: 10.0,
  currency: 'USD',
  month: '2026-01',
  ...overrides,
})

let dataSource: DataSource
let repository: SqliteCostRepository

beforeEach(async () => {
  dataSource = createDataSource(':memory:')
  await dataSource.initialize()
  repository = new SqliteCostRepository(dataSource)
})

afterEach(async () => {
  await dataSource.destroy()
})

describe('SqliteCostRepository', () => {
  it('saves and retrieves entries', async () => {
    await repository.save([entry()])
    const all = await repository.findAll()
    expect(all).toHaveLength(1)
    expect(all[0]).toMatchObject(entry())
  })

  it('save([]) does not throw', async () => {
    await expect(repository.save([])).resolves.toBeUndefined()
  })

  it('overwrites existing data for the same accountId + month', async () => {
    await repository.save([entry({ cost: 10.0 })])
    await repository.save([entry({ cost: 99.0 })])

    const all = await repository.findAll()
    expect(all).toHaveLength(1)
    expect(all[0].cost).toBe(99.0)
  })

  it('keeps rows for different months when saving one month', async () => {
    await repository.save([entry({ month: '2026-01' })])
    await repository.save([entry({ month: '2026-02', cost: 20.0 })])

    const all = await repository.findAll()
    expect(all).toHaveLength(2)
  })

  it('overwrites only the matching month, leaves others intact', async () => {
    await repository.save([entry({ month: '2026-01', cost: 10.0 }), entry({ month: '2026-02', cost: 20.0 })])
    await repository.save([entry({ month: '2026-01', cost: 99.0 })])

    const all = await repository.findAll()
    expect(all).toHaveLength(2)
    const jan = all.find((e) => e.month === '2026-01')
    expect(jan?.cost).toBe(99.0)
    const feb = all.find((e) => e.month === '2026-02')
    expect(feb?.cost).toBe(20.0)
  })

  it('findByMonth returns only entries for that month', async () => {
    await repository.save([entry({ month: '2026-01' }), entry({ month: '2026-02' })])

    const jan = await repository.findByMonth('2026-01')
    expect(jan).toHaveLength(1)
    expect(jan[0].month).toBe('2026-01')
  })

  it('findAll returns all entries across months', async () => {
    await repository.save([entry({ month: '2026-01' })])
    await repository.save([entry({ month: '2026-02' })])

    const all = await repository.findAll()
    expect(all).toHaveLength(2)
  })
})
