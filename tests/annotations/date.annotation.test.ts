import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import DateAnnotation from '~/persister/annotations/date.annotation.ts';

describe('DateAnnotation', () => {
  it('should initialize with type', () => {
    const annotation = new DateAnnotation('date');
    
    expect(annotation.name).toBe('Date');
    expect(annotation.type).toBe('date');
  });

  it('should accept timestamp type', () => {
    const annotation = new DateAnnotation('timestamp');
    
    expect(annotation.type).toBe('timestamp');
  });

  it('should accept time type', () => {
    const annotation = new DateAnnotation('time');
    
    expect(annotation.type).toBe('time');
  });

  it('should accept options parameter', () => {
    const options = { precision: 6, nullable: true };
    const annotation = new DateAnnotation('timestamp', options);
    
    expect(annotation.options).toBe(options);
  });

  it('should have default persists property', () => {
    const annotation = new DateAnnotation('date');
    
    expect(annotation.persists).toBe(true);
  });

  it('should have default stackable property', () => {
    const annotation = new DateAnnotation('date');
    
    expect(annotation.stackable).toBe(false);
  });
});
