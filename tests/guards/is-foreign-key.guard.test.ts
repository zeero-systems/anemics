import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import isForeignKey from '~/persister/guards/is-foreign-key.guard.ts';

describe('isForeignKey guard', () => {
  it('should return true for valid foreign key annotation', () => {
    const foreignKeyAnnotation = { name: 'ForeignKey', target: 'User' };
    expect(isForeignKey(foreignKeyAnnotation)).toBe(true);
  });

  it('should return false for non-foreign-key object', () => {
    const nonForeignKey = { name: 'NotForeignKey' };
    expect(isForeignKey(nonForeignKey)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isForeignKey(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isForeignKey(undefined)).toBe(false);
  });

  it('should return false for object with wrong name', () => {
    const wrongName = { name: 'SomethingElse' };
    expect(isForeignKey(wrongName)).toBe(false);
  });

  it('should return false for empty object', () => {
    expect(isForeignKey({})).toBe(false);
  });
});
