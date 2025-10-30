import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import isSchema from '~/persister/guards/is-schema.guard.ts';
import SchemaAnnotation from '~/persister/annotations/schema.annotation.ts';

describe('isSchema guard', () => {
  it('should return true for valid schema annotation', () => {
    const schemaAnnotation = new SchemaAnnotation('users');
    expect(isSchema(schemaAnnotation)).toBe(true);
  });

  it('should return false for non-schema object', () => {
    const nonSchema = { name: 'NotSchema' };
    expect(isSchema(nonSchema)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isSchema(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isSchema(undefined)).toBe(false);
  });

  it('should return false for object with wrong name', () => {
    const wrongName = { name: 'SomethingElse' };
    expect(isSchema(wrongName)).toBe(false);
  });
});
