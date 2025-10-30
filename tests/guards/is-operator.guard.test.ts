import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import isOperator from '~/querier/guards/is-operator.guard.ts';

describe('isOperator guard', () => {
  it('should return true for eq operator', () => {
    expect(isOperator('eq')).toBe(true);
  });

  it('should return true for lt operator', () => {
    expect(isOperator('lt')).toBe(true);
  });

  it('should return true for gt operator', () => {
    expect(isOperator('gt')).toBe(true);
  });

  it('should return true for like operator', () => {
    expect(isOperator('like')).toBe(true);
  });

  it('should return true for between operator', () => {
    expect(isOperator('between')).toBe(true);
  });

  it('should return true for in operator', () => {
    expect(isOperator('in')).toBe(true);
  });

  it('should return true for not in operator', () => {
    expect(isOperator('not in')).toBe(true);
  });

  it('should return true for is null operator', () => {
    expect(isOperator('is null')).toBe(true);
  });

  it('should return true for is not null operator', () => {
    expect(isOperator('is not null')).toBe(true);
  });

  it('should return true for exists operator', () => {
    expect(isOperator('exists')).toBe(true);
  });

  it('should return false for invalid operator', () => {
    expect(isOperator('invalid')).toBe(false);
  });

  it('should return false for equals operator', () => {
    expect(isOperator('equals')).toBe(false);
  });

  it('should return false for greater operator', () => {
    expect(isOperator('greater')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isOperator(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isOperator(undefined)).toBe(false);
  });

  it('should return false for number', () => {
    expect(isOperator(123)).toBe(false);
  });
});
