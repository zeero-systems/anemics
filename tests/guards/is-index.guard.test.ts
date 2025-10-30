import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import isIndex from '~/persister/guards/is-index.guard.ts';
import IndexAnnotation from '~/persister/annotations/index.annotation.ts';

describe('isIndex guard', () => {
  it('should return true for valid index annotation', () => {
    const indexAnnotation = new IndexAnnotation(['name']);
    expect(isIndex(indexAnnotation)).toBe(true);
  });

  it('should return true for index with multiple columns', () => {
    const indexAnnotation = new IndexAnnotation(['email', 'username']);
    expect(isIndex(indexAnnotation)).toBe(true);
  });

  it('should return false for non-index object', () => {
    const nonIndex = { name: 'NotIndex' };
    expect(isIndex(nonIndex)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isIndex(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isIndex(undefined)).toBe(false);
  });

  it('should return false for object with wrong name', () => {
    const wrongName = { name: 'SomethingElse' };
    expect(isIndex(wrongName)).toBe(false);
  });
});
