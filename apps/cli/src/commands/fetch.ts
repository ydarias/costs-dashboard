import { fetchCosts } from '@costs/fetchers'
import { SqliteCostRepository, createDataSource } from '@costs/repositories'
import { expandMonthRange } from '../utils/expand-month-range.js'
import { readConfig } from '../utils/read-config.js'
import { renderSummaryTable } from '../renderers/summary-table.js'

const MONTH_PATTERN = /^\d{4}-\d{2}$/

interface FetchOptions {
  from: string
  to?: string
  config: string
}

export async function fetchCommand(options: FetchOptions): Promise<void> {
  if (!MONTH_PATTERN.test(options.from)) {
    process.stderr.write(`Error: --from must be in YYYY-MM format, got "${options.from}"\n`)
    process.exit(1)
  }

  const to = options.to ?? options.from

  if (!MONTH_PATTERN.test(to)) {
    process.stderr.write(`Error: --to must be in YYYY-MM format, got "${to}"\n`)
    process.exit(1)
  }

  let months: string[]
  try {
    months = expandMonthRange(options.from, to)
  } catch (err) {
    process.stderr.write(`Error: ${(err as Error).message}\n`)
    process.exit(1)
  }

  const config = readConfig(options.config)

  const dbPath = process.env['DB_PATH'] ?? './costs.db'
  const dataSource = createDataSource(dbPath)
  await dataSource.initialize()

  const pairs = config.accounts.flatMap(({ id: accountId, apiKey }) =>
    months.map((month) => ({ accountId, month, apiKey })),
  )

  const results = await Promise.allSettled(
    pairs.map(({ accountId, month, apiKey }) => fetchCosts({ accountId, month, apiKey })),
  )

  const successEntries = results
    .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof fetchCosts>>> => r.status === 'fulfilled')
    .flatMap((r) => r.value)

  const failures = results
    .map((r, i) => (r.status === 'rejected' ? { pair: pairs[i], reason: r.reason } : null))
    .filter((f): f is NonNullable<typeof f> => f !== null)

  if (successEntries.length > 0) {
    const repository = new SqliteCostRepository(dataSource)
    await repository.save(successEntries)
  }

  await dataSource.destroy()

  for (const { id: accountId } of config.accounts) {
    renderSummaryTable(successEntries, accountId)
  }

  if (failures.length > 0) {
    process.stderr.write('\nFailed fetches:\n')
    for (const { pair, reason } of failures) {
      process.stderr.write(`  ${pair.accountId} / ${pair.month}: ${(reason as Error).message ?? reason}\n`)
    }
    process.exit(1)
  }
}
