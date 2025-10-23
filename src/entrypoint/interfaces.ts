import type { PackerInterface, TracerInterface, ContainerInterface } from '@zeero/commons';
import type { MiddlerInterface, RouterInterface } from '~/controller/interfaces.ts';

import { ServerInterface } from '~/network/interfaces.ts';

export interface AnemicInterface {
  boot(): void
  start(): void
  stop(): void
}

export interface ApplicationInterface {
  container: ContainerInterface;
  packer: PackerInterface
  router: RouterInterface
  middler: MiddlerInterface
  servers: Array<ServerInterface>
  tracer: TracerInterface
}

export interface PathInterface { 
  [key: string]: string | number 
}


export default {}