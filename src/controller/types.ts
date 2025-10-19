import type { ContainerInterface, DecoratorType, EntityInterface, KeyableType, NewableType } from '@zeero/commons';
import type { ServerOptionsType } from '~/network/types.ts';
import type { RequesterInterface, ResponserInterface } from '~/network/interfaces.ts';

import MethodEnum from '~/network/enums/method.enum.ts';
import EventEnum from '~/controller/enums/event.enum.ts';
import { FilterType } from '../persister/types.ts';

export type ControllerType = {
  key: KeyableType
  path: string
}

export type MethodProviderType = { parameter: string, provider: string  }

export type ActionType = {
  entity?: NewableType<new (...args: any[]) => EntityInterface>,
  filter?: FilterType,
}

export type MethodType = ActionType & {
  key: string
  path: string
  method: MethodEnum
}

export type DuplexType = ActionType & { 
  key: string; 
  namespace: string 
}

export type RouteType = {
  key: string
  action: MethodType | DuplexType
  controller: ControllerType
  pattern?: URLPattern
  pathname?: string
  decorators: Array<DecoratorType>
}

export type EventType = `${EventEnum}`

export type ContextType = {
  url: URLPatternResult
  route: RouteType
  container: ContainerInterface
  server: ServerOptionsType
  requester?: RequesterInterface | undefined
  responser?: ResponserInterface | undefined
  socket?: WebSocket | undefined
  handler: {
    attempts: number;
    error: any | undefined;
  }; 
}

export type NextFunctionType = () => Promise<void>

export type HttpMiddlewareHandlerType = (request: RequesterInterface, response: ResponserInterface, url: URLPatternResult) => Promise<void>
export type SocketMiddlewareHandlerType = (socket: WebSocket, url: URLPatternResult) => Promise<void>

export default {}