import type { ContainerInterface, DecoratorType, KeyableType } from '@zeero/commons';
import type { ServerOptionsType } from '~/network/types.ts';
import type { RequesterInterface, ResponserInterface } from '~/network/interfaces.ts';

import MethodEnum from '~/network/enums/method.enum.ts';
import EventEnum from '~/controller/enums/event.enum.ts';

export type ControllerType = {
  key: KeyableType
  path: string
}

export type MethodProviderType = { parameter: string, provider: string  }

export type MethodType = {
  method: MethodEnum
  key: string
  path: string
  providers: Array<MethodProviderType>
  decorators: Array<DecoratorType>
}

export type RouteType = {
  key: string
  action: MethodType | { key: string; namespace: string }
  controller: ControllerType
  pattern?: URLPattern
  pathname?: string
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