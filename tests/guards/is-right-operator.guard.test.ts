import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import isRightOperator from '~/querier/guards/is-right-operator.guard.ts';

describe('isRightOperator guard', () => {
  it('should return true for is null operator', () => {
    expect(isRightOperator('is null')).toBe(true);
  });

  it('should return true for is not null operator', () => {
    expect(isRightOperator('is not null')).toBe(true);
  });

  it('should return false for eq operator', () => {
    expect(isRightOperator('eq')).toBe(false);
  });

  it('should return false for lt operator', () => {
    expect(isRightOperator('lt')).toBe(false);
  });

  it('should return false for exists operator', () => {
    expect(isRightOperator('exists')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isRightOperator(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isRightOperator(undefined)).toBe(false);
  });

  it('should return false for invalid operator', () => {
    expect(isRightOperator('invalid')).toBe(false);
  });
});
