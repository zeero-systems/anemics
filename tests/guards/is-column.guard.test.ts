import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import isColumn from '~/persister/guards/is-column.guard.ts';

describe('isColumn guard', () => {
  it('should return true for valid column annotation', () => {
    const validColumn = { name: 'Character' };
    expect(isColumn(validColumn)).toBe(true);
  });

  it('should return true for numeric column', () => {
    const column = { name: 'Numeric' };
    expect(isColumn(column)).toBe(true);
  });

  it('should return true for date column', () => {
    const column = { name: 'Date' };
    expect(isColumn(column)).toBe(true);
  });

  it('should return false for column with wrong name', () => {
    const invalidColumn = { name: 'InvalidType' };
    expect(isColumn(invalidColumn)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isColumn(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isColumn(undefined)).toBe(false);
  });

  it('should return false for empty object', () => {
    expect(isColumn({})).toBe(false);
  });
});
