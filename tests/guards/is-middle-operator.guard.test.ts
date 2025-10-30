import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import isMiddleOperator from '~/querier/guards/is-middle-operator.guard.ts';

describe('isMiddleOperator guard', () => {
  it('should return true for eq operator', () => {
    expect(isMiddleOperator('eq')).toBe(true);
  });

  it('should return true for lt operator', () => {
    expect(isMiddleOperator('lt')).toBe(true);
  });

  it('should return true for gt operator', () => {
    expect(isMiddleOperator('gt')).toBe(true);
  });

  it('should return true for like operator', () => {
    expect(isMiddleOperator('like')).toBe(true);
  });

  it('should return true for between operator', () => {
    expect(isMiddleOperator('between')).toBe(true);
  });

  it('should return true for in operator', () => {
    expect(isMiddleOperator('in')).toBe(true);
  });

  it('should return true for not in operator', () => {
    expect(isMiddleOperator('not in')).toBe(true);
  });

  it('should return false for exists operator', () => {
    expect(isMiddleOperator('exists')).toBe(false);
  });

  it('should return false for is null operator', () => {
    expect(isMiddleOperator('is null')).toBe(false);
  });

  it('should return false for is not null operator', () => {
    expect(isMiddleOperator('is not null')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isMiddleOperator(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isMiddleOperator(undefined)).toBe(false);
  });

  it('should return false for invalid operator', () => {
    expect(isMiddleOperator('invalid')).toBe(false);
  });
});
