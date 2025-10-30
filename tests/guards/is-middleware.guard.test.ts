import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import isMiddleware from '~/controller/guards/is-middleware.guard.ts';

describe('isMiddleware guard', () => {
  it('should return true for valid middleware annotation', () => {
    const middlewareAnnotation = { events: ['after'], target: {} };
    expect(isMiddleware(middlewareAnnotation)).toBe(true);
  });

  it('should return true for middleware with multiple events', () => {
    const middleware = { events: ['before', 'after'] };
    expect(isMiddleware(middleware)).toBe(true);
  });

  it('should return false for object without events', () => {
    const nonMiddleware = { name: 'NotMiddleware' };
    expect(isMiddleware(nonMiddleware)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isMiddleware(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isMiddleware(undefined)).toBe(false);
  });

  it('should return false for object with wrong name', () => {
    const wrongName = { name: 'SomethingElse' };
    expect(isMiddleware(wrongName)).toBe(false);
  });
});
