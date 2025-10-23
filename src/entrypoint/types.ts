import type { ServerOptionsType } from '~/network/types.ts';
import type { MiddlewareInterface } from '~/controller/interfaces.ts';

import { NewableType } from '@zeero/commons';
import EventEnum from '~/controller/enums/event.enum.ts';

export type HandlerType = {
  event: `${EventEnum}`
  attempts: number 
  error?: any
}

export type ApplicationOptionsType = {
  http?: Array<ServerOptionsType> | ServerOptionsType, 
  socket?: Array<ServerOptionsType> | ServerOptionsType,
  middlewares?: Array<NewableType<new (...args: any[]) => MiddlewareInterface>>
}

export default {}