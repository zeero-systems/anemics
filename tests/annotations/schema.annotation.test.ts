import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import SchemaAnnotation from '~/persister/annotations/schema.annotation.ts';

describe('SchemaAnnotation', () => {
  it('should initialize with table name', () => {
    const annotation = new SchemaAnnotation('users');
    
    expect(annotation.name).toBe('Schema');
    expect(annotation.table).toBe('users');
  });

  it('should have default persists property', () => {
    const annotation = new SchemaAnnotation('users');
    
    expect(annotation.persists).toBe(true);
  });

  it('should have default stackable property', () => {
    const annotation = new SchemaAnnotation('users');
    
    expect(annotation.stackable).toBe(false);
  });

  it('should initialize empty arrays', () => {
    const annotation = new SchemaAnnotation('users');
    
    expect(annotation.indexes).toEqual([]);
    expect(annotation.columns).toEqual([]);
    expect(annotation.foreignKeys).toEqual([]);
    expect(annotation.relations).toEqual([]);
  });

  it('should accept options parameter', () => {
    const options = { naming: { table: 'custom_users' } } as any;
    const annotation = new SchemaAnnotation('users', options);
    
    expect(annotation.options).toBe(options);
  });

  it('should handle various table names', () => {
    const tables = ['users', 'posts', 'comments', 'user_profiles', 'orders'];

    tables.forEach(table => {
      const annotation = new SchemaAnnotation(table);
      expect(annotation.table).toBe(table);
    });
  });
});
