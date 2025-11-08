import type { ContainerInterface, PackerInterface, PackNewableType, TracerInterface } from '@zeero/commons';
import type { MiddlerInterface, RouterInterface } from '~/controller/interfaces.ts';

import { ServerInterface } from '~/network/interfaces.ts';
import { ApplicationOptionsType } from './types.ts';
import { ResourcerInterface } from '~/resourcer/interfaces.ts';

export interface AnemicInterface {
  boot(...args: any[]): void;
  start(...args: any[]): void;
  stop(...args: any[]): void;
}

export interface ApplicationInterface {
  pack: PackNewableType;
  container: ContainerInterface;
  packer: PackerInterface;
  router: RouterInterface;
  middler: MiddlerInterface;
  servers: Array<ServerInterface>;
  resourcer: ResourcerInterface;
  tracer: TracerInterface;
  options: ApplicationOptionsType;
}

export interface PathInterface {
  [key: string]: string | number;
}

export default {};
