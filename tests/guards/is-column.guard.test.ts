import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import isColumn from '~/persister/guards/is-column.guard.ts';

describe('isColumn guard', () => {
  it('should return true for valid column annotation', () => {
    const validColumn = { name: 'Column' };
    expect(isColumn(validColumn)).toBe(true);
  });

  it('should return true for column with type', () => {
    const column = { name: 'Column', type: 'varchar' };
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
