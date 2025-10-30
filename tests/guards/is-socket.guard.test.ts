import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import isSocket from '~/controller/guards/is-socket.guard.ts';

describe('isSocket guard', () => {
  it('should return true for valid socket annotation', () => {
    const socketAnnotation = { name: 'socket' };
    expect(isSocket(socketAnnotation)).toBe(true);
  });

  it('should return false for non-socket object', () => {
    const nonSocket = { name: 'NotSocket' };
    expect(isSocket(nonSocket)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isSocket(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isSocket(undefined)).toBe(false);
  });

  it('should return false for object with wrong name', () => {
    const wrongName = { name: 'SomethingElse' };
    expect(isSocket(wrongName)).toBe(false);
  });
});
