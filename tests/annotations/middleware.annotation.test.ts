import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import MiddlewareAnnotation from '~/controller/annotations/middleware.annotation.ts';

describe('MiddlewareAnnotation', () => {
  it('should initialize correctly', () => {
    const annotation = new MiddlewareAnnotation();
    
    expect(annotation.name).toBe('Middleware');
  });

  it('should have correct name property', () => {
    const annotation = new MiddlewareAnnotation();
    expect(annotation.name).toBe('Middleware');
  });
});
