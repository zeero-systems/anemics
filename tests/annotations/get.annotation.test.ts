import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import GetAnnotation from '~/controller/annotations/get.annotation.ts';

describe('GetAnnotation', () => {
  it('should initialize with path', () => {
    const annotation = new GetAnnotation('/users');
    
    expect(annotation.name).toBe('Get');
    expect(annotation.path).toBe('/users');
  });

  it('should handle path with parameters', () => {
    const annotation = new GetAnnotation('/users/:id');
    
    expect(annotation.path).toBe('/users/:id');
  });

  it('should handle empty path', () => {
    const annotation = new GetAnnotation();
    
    expect(annotation.name).toBe('Get');
    expect(annotation.path).toBeUndefined();
  });

  it('should have correct name property', () => {
    const annotation = new GetAnnotation('/test');
    expect(annotation.name).toBe('Get');
  });
});
