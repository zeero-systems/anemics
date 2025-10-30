import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import isBuilder from '~/querier/guards/is-builder.guard.ts';

describe('isBuilder guard', () => {
  it('should return true for valid builder object', () => {
    const validBuilder = { toQuery: () => 'SELECT * FROM users' };
    expect(isBuilder(validBuilder)).toBe(true);
  });

  it('should return true for builder with additional methods', () => {
    const builder = {
      toQuery: () => 'SELECT * FROM users',
      where: () => {},
      select: () => {},
    };
    expect(isBuilder(builder)).toBe(true);
  });

  it('should return false for object without toQuery method', () => {
    const invalidBuilder = { build: () => 'query' };
    expect(isBuilder(invalidBuilder)).toBe(false);
  });

  it('should return false for non-builder object', () => {
    const nonBuilder = { name: 'NotBuilder' };
    expect(isBuilder(nonBuilder)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isBuilder(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isBuilder(undefined)).toBe(false);
  });

  it('should return false for empty object', () => {
    expect(isBuilder({})).toBe(false);
  });
});
