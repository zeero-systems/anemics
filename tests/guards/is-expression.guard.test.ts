import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import isExpression from '~/querier/guards/is-expression.guard.ts';

describe('isExpression guard', () => {
  it('should return true for expression with operator', () => {
    const expression = { operator: 'eq', leftTerm: 'id', rightTerm: 1 };
    expect(isExpression(expression)).toBe(true);
  });

  it('should return true for object expression with operator', () => {
    const objectExpression = { operator: 'gt', leftTerm: 'age', rightTerm: 18 };
    expect(isExpression(objectExpression)).toBe(true);
  });

  it('should return true for complex expressions', () => {
    const expressions = [
      { operator: 'like', leftTerm: 'name', rightTerm: '%john%' },
      { operator: 'in', leftTerm: 'status', rightTerm: ['active', 'pending'] },
    ];
    
    expressions.forEach(expr => {
      expect(isExpression(expr)).toBe(true);
    });
  });

  it('should return false for object without operator', () => {
    expect(isExpression({ leftTerm: 'id', rightTerm: 1 })).toBe(false);
  });

  it('should return false for null', () => {
    expect(isExpression(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isExpression(undefined)).toBe(false);
  });

  it('should return false for number', () => {
    expect(isExpression(123)).toBe(false);
  });

  it('should return false for boolean', () => {
    expect(isExpression(true)).toBe(false);
  });
});
