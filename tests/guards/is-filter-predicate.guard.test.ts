import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import isFilterPredicate from '~/persister/guards/is-filter-predicate.guard.ts';

describe('isFilterPredicate guard', () => {
  it('should return true for predicate with or clause', () => {
    const validPredicate = { or: [{ column: 'id', operator: 'eq', value: 1 }] };
    expect(isFilterPredicate(validPredicate)).toBe(true);
  });

  it('should return true for predicate with and clause', () => {
    const validPredicate = { and: [{ column: 'status', operator: 'eq', value: 'active' }] };
    expect(isFilterPredicate(validPredicate)).toBe(true);
  });

  it('should return true for complex predicates', () => {
    const predicates = [
      { or: [{ column: 'age', operator: 'gt', value: 18 }] },
      { and: [{ column: 'name', operator: 'like', value: '%john%' }] },
    ];

    predicates.forEach(predicate => {
      expect(isFilterPredicate(predicate)).toBe(true);
    });
  });

  it('should return false for predicate without or/and', () => {
    const incompletePredicate = { column: 'id', value: 1 };
    expect(isFilterPredicate(incompletePredicate)).toBe(false);
  });

  it('should return false for non-predicate object', () => {
    const nonPredicate = { name: 'NotPredicate' };
    expect(isFilterPredicate(nonPredicate)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isFilterPredicate(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isFilterPredicate(undefined)).toBe(false);
  });

  it('should return false for empty object', () => {
    expect(isFilterPredicate({})).toBe(false);
  });
});
