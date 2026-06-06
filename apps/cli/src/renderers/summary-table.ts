import type { ResourceCostEntry } from '@costs/billing';
import Table from 'cli-table3';

export function renderSummaryTable(
  entries: ResourceCostEntry[],
  accountId: string,
  accountName: string,
  month: string,
): void {
  const table = new Table({
    head: ['Resource Name', 'Cost USD'],
    colAligns: ['left', 'right'],
  });

  const accountEntries = entries.filter((e) => e.accountId === accountId && e.month === month);
  let total = 0;

  for (const entry of accountEntries) {
    table.push([entry.resourceName, `$${entry.cost.toFixed(2)}`]);
    total += entry.cost;
  }

  console.log(`\nAccount: ${accountName} (${accountId}) — ${month}`);
  console.log(table.toString());
  console.log(`Total: $${total.toFixed(2)}`);
}
