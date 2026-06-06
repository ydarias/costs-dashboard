import type { ResourceCostEntry } from '@costs/billing';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { renderSummaryTable } from './summary-table.js';

afterEach(() => {
  vi.restoreAllMocks();
});

const entry = (overrides: Partial<ResourceCostEntry> = {}): ResourceCostEntry => ({
  accountId: 'acc-1',
  resourceName: 'Cloud Object Storage',
  cost: 12.34,
  currency: 'USD',
  month: '2026-01',
  ...overrides,
});

describe('renderSummaryTable', () => {
  it('prints the account header with name, id and month', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    renderSummaryTable([entry()], 'acc-1', 'My Account', '2026-01');
    const output = log.mock.calls.map((c) => c.join('')).join('\n');
    expect(output).toContain('My Account');
    expect(output).toContain('acc-1');
    expect(output).toContain('2026-01');
  });

  it('prints column headers', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    renderSummaryTable([entry()], 'acc-1', 'My Account', '2026-01');
    const output = log.mock.calls.map((c) => c.join('')).join('\n');
    expect(output).toContain('Resource Name');
    expect(output).toContain('Cost USD');
  });

  it('formats cost as $XX.XX', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    renderSummaryTable([entry({ cost: 12.34 })], 'acc-1', 'My Account', '2026-01');
    const output = log.mock.calls.map((c) => c.join('')).join('\n');
    expect(output).toContain('$12.34');
  });

  it('prints the total', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    renderSummaryTable(
      [entry({ cost: 5.0 }), entry({ cost: 7.5, resourceId: 'vpc' })],
      'acc-1', 'My Account', '2026-01',
    );
    const output = log.mock.calls.map((c) => c.join('')).join('\n');
    expect(output).toContain('Total: $12.50');
  });

  it('only renders entries for the given accountId', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    renderSummaryTable(
      [entry({ accountId: 'acc-1', resourceName: 'COS' }), entry({ accountId: 'acc-2', resourceName: 'VPC' })],
      'acc-1',
      'My Account',
      '2026-01',
    );
    const output = log.mock.calls.map((c) => c.join('')).join('\n');
    expect(output).toContain('COS');
    expect(output).not.toContain('VPC');
  });

  it('only renders entries for the given month', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    renderSummaryTable(
      [entry({ month: '2026-01', resourceName: 'COS' }), entry({ month: '2026-02', resourceName: 'VPC' })],
      'acc-1',
      'My Account',
      '2026-01',
    );
    const output = log.mock.calls.map((c) => c.join('')).join('\n');
    expect(output).toContain('COS');
    expect(output).not.toContain('VPC');
  });
});
