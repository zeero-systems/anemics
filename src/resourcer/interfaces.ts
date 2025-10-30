import type { EnvironmentType, PlatformType, ResourceType, SystemMemoryType, SystemType } from '~/resourcer/types.ts';

export interface ResourcerInterface {
  getService(cached?: boolean): Record<PropertyKey, any> | null;
  getPlatform(cached?: boolean): PlatformType | null;
  getSystem(cached?: boolean): SystemType | null;
  getEnvironment(cached?: boolean): EnvironmentType | null;
  getMemory(cached?: boolean): SystemMemoryType | null;

  getResource(refresh?: boolean): ResourceType | null;
}

export default {};
