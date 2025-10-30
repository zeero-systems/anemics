import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import isLeftOperator from '~/querier/guards/is-left-operator.guard.ts';

describe('isLeftOperator guard', () => {
  it('should return true for exists operator', () => {
    expect(isLeftOperator('exists')).toBe(true);
  });

  it('should return false for not exists operator', () => {
    expect(isLeftOperator('not exists')).toBe(false);
  });

  it('should return false for eq operator', () => {
    expect(isLeftOperator('eq')).toBe(false);
  });

  it('should return false for lt operator', () => {
    expect(isLeftOperator('lt')).toBe(false);
  });

  it('should return false for gt operator', () => {
    expect(isLeftOperator('gt')).toBe(false);
  });

  it('should return false for is null operator', () => {
    expect(isLeftOperator('is null')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isLeftOperator(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isLeftOperator(undefined)).toBe(false);
  });

  it('should return false for invalid operator', () => {
    expect(isLeftOperator('invalid')).toBe(false);
  });
});
