import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import CharacterAnnotation from '~/persister/annotations/character.annotation.ts';

describe('CharacterAnnotation', () => {
  it('should initialize with type', () => {
    const annotation = new CharacterAnnotation('varchar');
    
    expect(annotation.name).toBe('Character');
    expect(annotation.type).toBe('varchar');
  });

  it('should accept char type', () => {
    const annotation = new CharacterAnnotation('char');
    
    expect(annotation.type).toBe('char');
  });

  it('should accept text type', () => {
    const annotation = new CharacterAnnotation('text');
    
    expect(annotation.type).toBe('text');
  });

  it('should accept options parameter', () => {
    const options = { length: 255, nullable: true };
    const annotation = new CharacterAnnotation('varchar', options);
    
    expect(annotation.options).toBe(options);
  });

  it('should have default persists property', () => {
    const annotation = new CharacterAnnotation('varchar');
    
    expect(annotation.persists).toBe(true);
  });

  it('should have default stackable property', () => {
    const annotation = new CharacterAnnotation('varchar');
    
    expect(annotation.stackable).toBe(false);
  });
});
