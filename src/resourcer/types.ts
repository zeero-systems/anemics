
export type PlatformType = {
  name: string
  engine: string
  version: string
  language: string
}

export type SystemType = {
  os: string;
  arch: string;
  vendor: string;
  pid: number;
  ppid: number;
  target: string;
  execPath: string;
  entrypoint: string;
  hostname: string;
};

export type EnvironmentType = Record<string, string>;

export type SystemMemoryType = {
  total: number;
  free: number;
  available: number;
  buffers: number;
  cached: number;
  swapTotal: number;
  swapFree: number;
};

export type ResourceType = {
  environment?: EnvironmentType | Record<string, never>;
  memory?: SystemMemoryType | Record<string, never>;
  platform?: PlatformType | Record<string, never>;
  service?: Record<string, string> | Record<string, never>;
  system?: SystemType | Record<string, never>;
};

export type ResourcerOptionsType = {
  allowedKeys?: string[];
  allowedPrefixes?: string[];
  service?: Record<string, string>;
};

export default {};
