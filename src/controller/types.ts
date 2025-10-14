import type { ContainerInterface, KeyableType } from '@zeero/commons';
import type { ServerOptionsType } from '~/network/types.ts';
import type { RequestInterface, ResponseInterface } from '~/network/interfaces.ts';

import MethodEnum from '~/network/enums/method.enum.ts';

export type ControllerType = {
  key: KeyableType
  path: string
}

export type EventType = {
  key: string
  namespace: string
}

export type MethodType = {
  method: MethodEnum
  key: string
  path: string
}

export type RouteType = {
  key: string
  action: MethodType | EventType
  controller: ControllerType
  pattern?: URLPattern
  pathname?: string
}

export type OptionsType = {
  event: EventType
  weight: number
} & { [key: string | symbol]: any }


export type MiddlewareEventType = 'before' | 'middle' | 'after'

export type ContextType = {
  url: URLPatternResult
  route: RouteType
  container: ContainerInterface
  server: ServerOptionsType
  request?: RequestInterface | undefined
  response?: ResponseInterface | undefined
  socket?: WebSocket | undefined
  result?: any | undefined
}

export type NextFunctionType = () => Promise<void>

export type HttpMiddlewareHandlerType = (request: RequestInterface, response: ResponseInterface, url: URLPatternResult) => Promise<void>
export type SocketMiddlewareHandlerType = (socket: WebSocket, url: URLPatternResult) => Promise<void>

export default {}