import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import isFilter from '~/persister/guards/is-filter.guard.ts';

describe('isFilter guard', () => {
  it('should return true for simple boolean filter', () => {
    expect(isFilter(true)).toBe(true);
  });

  it('should return true for filter with select', () => {
    const selectFilter = { select: ['id', 'name'] };
    expect(isFilter(selectFilter)).toBe(true);
  });

  it('should return true for filter with where clause', () => {
    const whereFilter = { where: { id: 1 } };
    expect(isFilter(whereFilter)).toBe(true);
  });

  it('should return true for filter with order clause', () => {
    const orderFilter = { order: { id: 'asc' } };
    expect(isFilter(orderFilter)).toBe(true);
  });

  it('should return true for filter with group clause', () => {
    const groupFilter = { group: ['category'] };
    expect(isFilter(groupFilter)).toBe(true);
  });

  it('should return true for combined filter', () => {
    const combinedFilter = {
      select: ['id', 'name'],
      where: { active: true },
      order: { created_at: 'desc' },
    };
    expect(isFilter(combinedFilter)).toBe(true);
  });

  it('should return false for invalid filter object', () => {
    const nonFilter = { invalid: true };
    expect(isFilter(nonFilter)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isFilter(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isFilter(undefined)).toBe(false);
  });

  it('should return false for false boolean', () => {
    expect(isFilter(false)).toBe(false);
  });

  it('should return false for empty object', () => {
    expect(isFilter({})).toBe(false);
  });
});
