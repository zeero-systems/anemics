import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import isController from '~/controller/guards/is-controller.guard.ts';
import ControllerAnnotation from '~/controller/annotations/controller.annotation.ts';

describe('isController guard', () => {
  it('should return true for valid controller annotation', () => {
    const controllerAnnotation = new ControllerAnnotation('/api');
    expect(isController(controllerAnnotation)).toBe(true);
  });

  it('should return false for non-controller object', () => {
    const nonController = { name: 'NotController' };
    expect(isController(nonController)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isController(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isController(undefined)).toBe(false);
  });

  it('should return false for object with wrong name', () => {
    const wrongName = { name: 'SomethingElse' };
    expect(isController(wrongName)).toBe(false);
  });

  it('should return false for empty object', () => {
    expect(isController({})).toBe(false);
  });
});
