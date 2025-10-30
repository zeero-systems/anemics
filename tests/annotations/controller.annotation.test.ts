import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import ControllerAnnotation from '~/controller/annotations/controller.annotation.ts';

describe('ControllerAnnotation', () => {
  it('should initialize with path', () => {
    const annotation = new ControllerAnnotation('/api');
    
    expect(annotation.name).toBe('Controller');
    expect(annotation.path).toBe('/api');
  });

  it('should handle default path', () => {
    const annotation = new ControllerAnnotation();
    
    expect(annotation.name).toBe('Controller');
    expect(annotation.path).toBe('');
  });

  it('should handle various path formats', () => {
    const paths = [
      '/',
      '/api',
      '/api/v1',
      '/users/:id',
      '',
    ];

    paths.forEach(path => {
      const annotation = new ControllerAnnotation(path);
      expect(annotation.path).toBe(path);
    });
  });

  it('should have correct name property', () => {
    const annotation = new ControllerAnnotation('/test');
    expect(annotation.name).toBe('Controller');
  });
});
