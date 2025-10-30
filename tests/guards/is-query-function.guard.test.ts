import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import isQueryFunction from '~/querier/guards/is-query-function.guard.ts';

describe('isQueryFunction guard', () => {
  it('should return true for function', () => {
    const fn = () => {};
    expect(isQueryFunction(fn)).toBe(true);
  });

  it('should return true for arrow function', () => {
    const fn = (query: any) => query;
    expect(isQueryFunction(fn)).toBe(true);
  });

  it('should return true for named function', () => {
    function testFn() {}
    expect(isQueryFunction(testFn)).toBe(true);
  });

  it('should return false for string', () => {
    expect(isQueryFunction('COUNT')).toBe(false);
  });

  it('should return false for number', () => {
    expect(isQueryFunction(123)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isQueryFunction(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isQueryFunction(undefined)).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isQueryFunction('')).toBe(false);
  });
});
