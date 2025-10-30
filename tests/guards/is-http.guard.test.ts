import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import isHttp from '~/controller/guards/is-http.guard.ts';
import GetAnnotation from '~/controller/annotations/get.annotation.ts';
import PostAnnotation from '~/controller/annotations/post.annotation.ts';
import PutAnnotation from '~/controller/annotations/put.annotation.ts';
import DeleteAnnotation from '~/controller/annotations/delete.annotation.ts';
import PatchAnnotation from '~/controller/annotations/patch.annotation.ts';

describe('isHttp guard', () => {
  it('should return true for GET annotation', () => {
    const httpAnnotation = new GetAnnotation('/users');
    expect(isHttp(httpAnnotation)).toBe(true);
  });

  it('should return true for POST annotation', () => {
    const httpAnnotation = new PostAnnotation('/users');
    expect(isHttp(httpAnnotation)).toBe(true);
  });

  it('should return true for PUT annotation', () => {
    const httpAnnotation = new PutAnnotation('/users/:id');
    expect(isHttp(httpAnnotation)).toBe(true);
  });

  it('should return true for DELETE annotation', () => {
    const httpAnnotation = new DeleteAnnotation('/users/:id');
    expect(isHttp(httpAnnotation)).toBe(true);
  });

  it('should return true for PATCH annotation', () => {
    const httpAnnotation = new PatchAnnotation('/users/:id');
    expect(isHttp(httpAnnotation)).toBe(true);
  });

  it('should return false for non-http object', () => {
    const nonHttp = { name: 'NotHttp' };
    expect(isHttp(nonHttp)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isHttp(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isHttp(undefined)).toBe(false);
  });
});
