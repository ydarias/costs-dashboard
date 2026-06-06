import type { ResourceCostEntry } from '@costs/billing';
import Table from 'cli-table3';

export function renderSummaryTable(entries: ResourceCostEntry[], accountId: string): void {
  const table = new Table({
    head: ['Resource Name', 'Month', 'Cost USD'],
    colAligns: ['left', 'left', 'right'],
  });

  const accountEntries = entries.filter((e) => e.accountId === accountId);
  let total = 0;

  for (const entry of accountEntries) {
    table.push([entry.resourceName, entry.month, `$${entry.cost.toFixed(2)}`]);
    total += entry.cost;
  }

  console.log(`\nAccount: ${accountId}`);
  console.log(table.toString());
  console.log(`Total: $${total.toFixed(2)}`);
}
