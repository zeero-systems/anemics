import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import NumericAnnotation from '~/persister/annotations/numeric.annotation.ts';

describe('NumericAnnotation', () => {
  it('should initialize with type', () => {
    const annotation = new NumericAnnotation('integer');
    
    expect(annotation.name).toBe('Numeric');
    expect(annotation.type).toBe('integer');
  });

  it('should accept bigint type', () => {
    const annotation = new NumericAnnotation('bigint');
    
    expect(annotation.type).toBe('bigint');
  });

  it('should accept decimal type', () => {
    const annotation = new NumericAnnotation('decimal');
    
    expect(annotation.type).toBe('decimal');
  });

  it('should accept options parameter', () => {
    const options = { precision: 10, scale: 2, nullable: false };
    const annotation = new NumericAnnotation('numeric', options);
    
    expect(annotation.options).toBe(options);
  });

  it('should have default persists property', () => {
    const annotation = new NumericAnnotation('integer');
    
    expect(annotation.persists).toBe(true);
  });

  it('should have default stackable property', () => {
    const annotation = new NumericAnnotation('integer');
    
    expect(annotation.stackable).toBe(false);
  });
});
