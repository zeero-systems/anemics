import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import ColumnAnnotation from '~/persister/annotations/column.annotation.ts';

describe('ColumnAnnotation', () => {
  it('should create a column annotation with varchar type', () => {
    const annotation = new ColumnAnnotation('varchar', { length: 255 });
    expect(annotation.name).toBe('Column');
    expect(annotation.type).toBe('varchar');
    expect(annotation.options?.length).toBe(255);
  });

  it('should create a column annotation with integer type', () => {
    const annotation = new ColumnAnnotation('integer');
    expect(annotation.name).toBe('Column');
    expect(annotation.type).toBe('integer');
  });

  it('should create a column annotation with numeric type and precision/scale', () => {
    const annotation = new ColumnAnnotation('numeric', { precision: 10, scale: 2 });
    expect(annotation.name).toBe('Column');
    expect(annotation.type).toBe('numeric');
    expect(annotation.options?.precision).toBe(10);
    expect(annotation.options?.scale).toBe(2);
  });

  it('should create a column annotation with timestamp type', () => {
    const annotation = new ColumnAnnotation('timestamp');
    expect(annotation.name).toBe('Column');
    expect(annotation.type).toBe('timestamp');
  });

  it('should create a column annotation with json type', () => {
    const annotation = new ColumnAnnotation('json');
    expect(annotation.name).toBe('Column');
    expect(annotation.type).toBe('json');
  });

  it('should have persists set to true', () => {
    const annotation = new ColumnAnnotation('text');
    expect(annotation.persists).toBe(true);
  });

  it('should have stackable set to false', () => {
    const annotation = new ColumnAnnotation('boolean');
    expect(annotation.stackable).toBe(false);
  });

  it('should create a column annotation with all column types', () => {
    const types: Array<any> = [
      'char', 'varchar', 'text', 'bigint', 'integer', 'boolean',
      'date', 'timestamp', 'json', 'uuid', 'point', 'inet'
    ];
    
    types.forEach(type => {
      const annotation = new ColumnAnnotation(type);
      expect(annotation.name).toBe('Column');
      expect(annotation.type).toBe(type);
    });
  });
});
