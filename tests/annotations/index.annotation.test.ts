import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import IndexAnnotation from '~/persister/annotations/index.annotation.ts';

describe('IndexAnnotation', () => {
  it('should initialize with single column', () => {
    const annotation = new IndexAnnotation(['name']);
    
    expect(annotation.name).toBe('Index');
  });

  it('should initialize with multiple columns', () => {
    const columns = ['email', 'username'];
    const annotation = new IndexAnnotation(columns);
    
    expect(annotation.name).toBe('Index');
  });

  it('should handle empty column array', () => {
    const annotation = new IndexAnnotation([]);
    
    expect(annotation.name).toBe('Index');
  });

  it('should have default persists property', () => {
    const annotation = new IndexAnnotation(['name']);
    
    expect(annotation.persists).toBe(true);
  });

  it('should have default stackable property', () => {
    const annotation = new IndexAnnotation(['name']);
    
    expect(annotation.stackable).toBe(false);
  });

  it('should accept options parameter', () => {
    const options = { unique: true } as any;
    const annotation = new IndexAnnotation(['email'], options);
    
    expect(annotation.options).toBe(options);
  });
});
