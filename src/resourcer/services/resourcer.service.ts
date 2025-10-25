import type { ResourcerInterface } from '~/resourcer/interfaces.ts';
import type {
  EnvironmentType,
  PlatformType,
  ResourcerOptionsType,
  ResourceType,
  SystemMemoryType,
  SystemType,
} from '~/resourcer/types.ts';

export class Resourcer implements ResourcerInterface {
  private allowedKeys: Array<string>;
  private allowedPrefixes: Array<string>;

  private cachedService: Record<string, string> | null = null;
  private cachedPlatform: PlatformType | null = null;
  private cachedSystem: SystemType | null = null;
  private cachedEnvironment: EnvironmentType | null = null;
  private cachedMemory: SystemMemoryType | null = null;

  constructor(options: ResourcerOptionsType = {}) {
    this.allowedKeys = options.allowedKeys || ['NODE_ENV', 'ENVIRONMENT', 'DEPLOYMENT_ENV'];
    this.allowedPrefixes = options.allowedPrefixes || ['DENO_', 'OTEL_'];
    this.cachedService = options.service || null;
  }

  public getService(_refresh?: boolean): Record<PropertyKey, string> | null {
    return this.cachedService;
  }

  public getPlatform(refresh?: boolean): PlatformType | null {
    if (!refresh && this.cachedPlatform) {
      return this.cachedPlatform;
    }

    try {
      this.cachedPlatform = {
        name: 'Deno',
        engine: Deno.version.v8,
        version: Deno.version.deno,
        language: `TypeScript v${Deno.version.typescript}`,
      };
    } catch (_error: any) {
      // Ignore permission errors
      return null;
    }

    return this.cachedPlatform;
  }

  public getSystem(refresh?: boolean): SystemType | null {
    if (!refresh && this.cachedSystem) {
      return this.cachedSystem;
    }

    let hostname = 'unknown';
    try {
      hostname = Deno.hostname() || 'unknown';
    } catch (_error: any) {
      // Ignore permission errors
    }

    this.cachedSystem = {
      os: Deno.build.os,
      arch: Deno.build.arch,
      vendor: Deno.build.vendor,
      target: Deno.build.target,
      pid: Deno.pid,
      ppid: Deno.ppid,
      execPath: Deno.execPath(),
      entrypoint: Deno.mainModule,
      hostname,
    };

    return this.cachedSystem;
  }

  public getEnvironment(refresh?: boolean): EnvironmentType | null {
    if (!refresh && this.cachedEnvironment) {
      return this.cachedEnvironment;
    }

    try {
      const env = Deno.env.toObject();

      for (const [key, value] of Object.entries(env)) {
        const shouldInclude = this.allowedPrefixes.some((prefix) => key.startsWith(prefix)) ||
          this.allowedKeys.includes(key);

        if (shouldInclude) {
          if (!this.cachedEnvironment) this.cachedEnvironment = {};
          this.cachedEnvironment[key] = value;
        }
      }
    } catch (_error: any) {
      // Ignore permission errors
      return null;
    }

    return this.cachedEnvironment;
  }

  public getMemory(refresh?: boolean): SystemMemoryType | null {
    if (!refresh && this.cachedMemory) {
      return this.cachedMemory;
    }

    try {
      const memInfo = Deno.systemMemoryInfo();

      this.cachedMemory = {
        total: memInfo.total,
        free: memInfo.free,
        available: memInfo.available,
        buffers: memInfo.buffers || 0,
        cached: memInfo.cached || 0,
        swapTotal: memInfo.swapTotal,
        swapFree: memInfo.swapFree,
      };
    } catch (_error: any) {
      // Ignore permission errors
      return null;
    }
    return this.cachedMemory;
  }

  getResource(refresh?: boolean): ResourceType | null {
    let resource = null
    const platform = this.getPlatform(refresh)
    const service = this.getService(refresh)
    const system = this.getSystem(refresh)
    const environment = this.getEnvironment(refresh)
    const memory = this.getMemory(refresh)

    if (platform || service || system || environment || memory) {
      resource = {} as ResourceType

      if (platform) resource.platform = platform
      if (service) resource.service = service
      if (system) resource.system = system
      if (environment) resource.environment = environment
      if (memory) resource.memory = memory
    }

    return resource
  }
}

export default Resourcer;
