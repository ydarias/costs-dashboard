import { describe, it, expect } from 'vitest';

import { expandMonthRange } from './expand-month-range.js';

describe('expandMonthRange', () => {
  it('returns a single month when from equals to', () => {
    expect(expandMonthRange('2026-01', '2026-01')).toEqual(['2026-01']);
  });

  it('expands a range within the same year', () => {
    expect(expandMonthRange('2026-01', '2026-03')).toEqual(['2026-01', '2026-02', '2026-03']);
  });

  it('expands a range that crosses year boundaries', () => {
    expect(expandMonthRange('2025-11', '2026-02')).toEqual(['2025-11', '2025-12', '2026-01', '2026-02']);
  });

  it('throws when from is after to', () => {
    expect(() => expandMonthRange('2026-03', '2026-01')).toThrow('--from');
  });
});
