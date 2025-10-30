import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import isRaw from '~/querier/guards/is-raw.guard.ts';

describe('isRaw guard', () => {
  it('should return true for valid raw query object', () => {
    const validRaw = { text: 'SELECT * FROM users WHERE id = ?' };
    expect(isRaw(validRaw)).toBe(true);
  });

  it('should return true for raw query with parameters', () => {
    const validRaw = { text: 'SELECT * FROM users WHERE id = ? AND name = ?', args: [1, 'John'] };
    expect(isRaw(validRaw)).toBe(true);
  });

  it('should return false for object without text property', () => {
    const invalidRaw = { query: 'SELECT * FROM users' };
    expect(isRaw(invalidRaw)).toBe(false);
  });

  it('should return false for non-raw object', () => {
    const nonRaw = { name: 'NotRaw' };
    expect(isRaw(nonRaw)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isRaw(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isRaw(undefined)).toBe(false);
  });

  it('should return false for empty object', () => {
    expect(isRaw({})).toBe(false);
  });

  it('should return false for string', () => {
    expect(isRaw('SELECT * FROM users')).toBe(false);
  });
});