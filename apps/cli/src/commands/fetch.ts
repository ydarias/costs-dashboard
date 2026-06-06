import {CostsFetcher, type CostEntry} from '@costs/fetchers';
import {createDataSource, SqliteCostRepository} from '@costs/repositories';

import {renderSummaryTable} from '../renderers/summary-table.js';
import type {FetchOptions} from "../types/fetch-options";
import {MONTH_PATTERN} from "../types/month-pattern";
import {expandMonthRange} from '../utils/expand-month-range.js';
import {readConfig} from '../utils/read-config.js';

function parseMonths(options: FetchOptions) {
  if (!MONTH_PATTERN.test(options.from)) {
    process.stderr.write(`Error: --from must be in YYYY-MM format, got "${options.from}"\n`);
    process.exit(1);
  }

  const to = options.to ?? options.from;

  if (!MONTH_PATTERN.test(to)) {
    process.stderr.write(`Error: --to must be in YYYY-MM format, got "${to}"\n`);
    process.exit(1);
  }

  let months: string[];
  try {
    months = expandMonthRange(options.from, to);
  } catch (err) {
    process.stderr.write(`Error: ${(err as Error).message}\n`);
    process.exit(1);
  }
  return months;
}

export async function fetchCommand(options: FetchOptions): Promise<void> {
  const months = parseMonths(options);

  const config = readConfig(options.config);

  const dbPath = process.env['DB_PATH'] ?? './costs.db';
  const dataSource = createDataSource(dbPath);
  await dataSource.initialize();

  const fetcher = new CostsFetcher();

  const pairs = config.accounts.flatMap(({ id: accountId, apiKey }) =>
    months.map((month) => ({ accountId, month, apiKey })),
  );

  const results = await Promise.allSettled(
    pairs.map(({ accountId, month, apiKey }) => fetcher.fetch({ accountId, month, apiKey })),
  );

  const successEntries = results
    .filter((r): r is PromiseFulfilledResult<CostEntry[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value);

  const failures = results
    .map((r, i) => (r.status === 'rejected' ? { pair: pairs[i], reason: r.reason } : null))
    .filter((f): f is NonNullable<typeof f> => f !== null);

  if (successEntries.length > 0) {
    const repository = new SqliteCostRepository(dataSource);
    await repository.save(successEntries);
  }

  await dataSource.destroy();

  for (const { id: accountId } of config.accounts) {
    renderSummaryTable(successEntries, accountId);
  }

  if (failures.length > 0) {
    process.stderr.write('\nFailed fetches:\n');
    for (const { pair, reason } of failures) {
      process.stderr.write(`  ${pair.accountId} / ${pair.month}: ${(reason as Error).message ?? reason}\n`);
    }
    process.exit(1);
  }
}
