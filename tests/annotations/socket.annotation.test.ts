import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import SocketAnnotation from '~/controller/annotations/socket.annotation.ts';

describe('SocketAnnotation', () => {
  it('should initialize with namespace', () => {
    const annotation = new SocketAnnotation('/chat');
    
    expect(annotation.name).toBe('Socket');
    expect(annotation.namespace).toBe('/chat');
  });

  it('should handle empty namespace', () => {
    const annotation = new SocketAnnotation();
    
    expect(annotation.name).toBe('Socket');
    expect(annotation.namespace).toBeUndefined();
  });

  it('should have correct name property', () => {
    const annotation = new SocketAnnotation('/notifications');
    expect(annotation.name).toBe('Socket');
  });

  it('should handle various namespace formats', () => {
    const namespaces = [
      '/',
      '/chat',
      '/notifications',
      '/room/:id',
      '',
    ];

    namespaces.forEach(namespace => {
      const annotation = new SocketAnnotation(namespace);
      expect(annotation.namespace).toBe(namespace);
    });
  });
});
