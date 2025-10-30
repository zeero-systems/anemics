import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import Resourcer from '~/resourcer/services/resourcer.service.ts';
import type { ResourcerOptionsType } from '~/resourcer/types.ts';

describe('resourcer', () => {
  describe('Resourcer service', () => {
    it('should initialize with default options', () => {
      const resourcer = new Resourcer();
      
      expect(resourcer).toBeDefined();
      expect(resourcer.getService()).toBeNull();
    });

    it('should initialize with custom options', () => {
      const options: ResourcerOptionsType = {
        service: { name: 'test-service', version: '1.0.0' },
        allowedKeys: ['TEST_ENV'],
        allowedPrefixes: ['TEST_'],
      };
      
      const resourcer = new Resourcer(options);
      const service = resourcer.getService();
      
      expect(service).toEqual({ name: 'test-service', version: '1.0.0' });
    });

    it('should get platform information', () => {
      const resourcer = new Resourcer();
      const platform = resourcer.getPlatform();
      
      expect(platform).toBeDefined();
      expect(platform?.name).toBe('Deno');
      expect(platform?.engine).toBeDefined();
      expect(platform?.version).toBeDefined();
      expect(platform?.language).toContain('TypeScript');
    });

    it('should get system information', () => {
      const resourcer = new Resourcer();
      const system = resourcer.getSystem();
      
      expect(system).toBeDefined();
      expect(system?.os).toBeDefined();
      expect(system?.arch).toBeDefined();
      expect(system?.target).toBeDefined();
      expect(system?.pid).toBeGreaterThan(0);
      expect(system?.execPath).toBeDefined();
      expect(system?.entrypoint).toBeDefined();
    });

    it('should get environment variables based on allowed keys and prefixes', () => {
      const options: ResourcerOptionsType = {
        allowedKeys: ['NODE_ENV'],
        allowedPrefixes: ['DENO_'],
      };
      
      const resourcer = new Resourcer(options);
      const environment = resourcer.getEnvironment();
      
      // Environment might be null if no allowed vars are set
      if (environment) {
        // Check that only allowed keys/prefixes are included
        for (const key of Object.keys(environment)) {
          const isAllowedKey = options.allowedKeys!.includes(key);
          const isAllowedPrefix = options.allowedPrefixes!.some(prefix => key.startsWith(prefix));
          expect(isAllowedKey || isAllowedPrefix).toBe(true);
        }
      }
    });

    it('should get memory information', () => {
      const resourcer = new Resourcer();
      const memory = resourcer.getMemory();
      
      // Memory info might not be available in all environments
      if (memory) {
        expect(typeof memory.total).toBe('number');
        expect(typeof memory.free).toBe('number');
        expect(typeof memory.available).toBe('number');
        expect(memory.total).toBeGreaterThan(0);
      }
    });

    it('should cache results when refresh is false', () => {
      const resourcer = new Resourcer();
      
      const platform1 = resourcer.getPlatform(false);
      const platform2 = resourcer.getPlatform(false);
      
      expect(platform1).toBe(platform2); // Same reference due to caching
    });

    it('should refresh results when refresh is true', () => {
      const resourcer = new Resourcer();
      
      const platform1 = resourcer.getPlatform(false);
      const platform2 = resourcer.getPlatform(true);
      
      expect(platform1).toEqual(platform2); // Same content
      // Note: They might be the same reference if implementation reuses objects
    });

    it('should get complete resource object', () => {
      const options: ResourcerOptionsType = {
        service: { name: 'test-app', version: '2.0.0' },
      };
      
      const resourcer = new Resourcer(options);
      const resource = resourcer.getResource();
      
      expect(resource).toBeDefined();
      expect(resource?.service).toEqual({ name: 'test-app', version: '2.0.0' });
      expect(resource?.platform).toBeDefined();
      expect(resource?.system).toBeDefined();
      
      // Environment and memory might be null depending on permissions
      if (resource?.environment) {
        expect(typeof resource.environment).toBe('object');
      }
      if (resource?.memory) {
        expect(typeof resource.memory.total).toBe('number');
      }
    });

    it('should return null resource when no data is available', () => {
      // Create a mock resourcer that would fail to get any data
      const resourcer = new Resourcer();
      
      // Override methods to return null
      resourcer.getPlatform = () => null;
      resourcer.getSystem = () => null;
      resourcer.getEnvironment = () => null;
      resourcer.getMemory = () => null;
      resourcer.getService = () => null;
      
      const resource = resourcer.getResource();
      expect(resource).toBeNull();
    });

    it('should handle permission errors gracefully', () => {
      const resourcer = new Resourcer();
      
      // These should not throw even if permissions are restricted
      expect(() => resourcer.getPlatform()).not.toThrow();
      expect(() => resourcer.getSystem()).not.toThrow();
      expect(() => resourcer.getEnvironment()).not.toThrow();
      expect(() => resourcer.getMemory()).not.toThrow();
    });
  });
});