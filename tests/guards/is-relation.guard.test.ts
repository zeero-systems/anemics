import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import isRelation from '~/persister/guards/is-relation.guard.ts';

describe('isRelation guard', () => {
  it('should return true for valid relation annotation', () => {
    const relationAnnotation = { name: 'Relation', target: {} };
    expect(isRelation(relationAnnotation)).toBe(true);
  });

  it('should return false for non-relation object', () => {
    const nonRelation = { name: 'NotRelation' };
    expect(isRelation(nonRelation)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isRelation(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isRelation(undefined)).toBe(false);
  });

  it('should return false for object with wrong name', () => {
    const wrongName = { name: 'SomethingElse' };
    expect(isRelation(wrongName)).toBe(false);
  });

  it('should return false for empty object', () => {
    expect(isRelation({})).toBe(false);
  });
});
