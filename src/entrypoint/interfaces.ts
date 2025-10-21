import type { PackerInterface, TimerInterface } from '@zeero/commons';
import type { MiddlerInterface, RouterInterface } from '~/controller/interfaces.ts';

import { ServerInterface } from '~/network/interfaces.ts';

export interface AnemicInterface {
  boot(): void
  start(): void
  stop(): void
}

export interface ApplicationInterface {
  timer: TimerInterface
  packer: PackerInterface
  router: RouterInterface
  middler: MiddlerInterface
  servers: Array<ServerInterface>
}

export interface PathInterface { 
  [key: string]: string | number 
}


export default {}