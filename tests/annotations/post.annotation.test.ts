import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import PostAnnotation from '~/controller/annotations/post.annotation.ts';

describe('PostAnnotation', () => {
  it('should initialize with path', () => {
    const annotation = new PostAnnotation('/users');
    
    expect(annotation.name).toBe('Post');
    expect(annotation.path).toBe('/users');
  });

  it('should handle path with entity', () => {
    class UserEntity {}
    const annotation = new PostAnnotation('/users', UserEntity as any);
    
    expect(annotation.path).toBe('/users');
    expect(annotation.entity).toBe(UserEntity);
  });

  it('should handle empty parameters', () => {
    const annotation = new PostAnnotation();
    
    expect(annotation.name).toBe('Post');
    expect(annotation.path).toBeUndefined();
    expect(annotation.entity).toBeUndefined();
  });

  it('should have correct name property', () => {
    const annotation = new PostAnnotation('/test');
    expect(annotation.name).toBe('Post');
  });
});
