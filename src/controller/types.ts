import type { ContainerInterface, KeyableType } from '@zeero/commons';
import type { ServerOptionsType } from '~/network/types.ts';
import type { RequestInterface, ResponseInterface } from '~/network/interfaces.ts';

import MethodEnum from '~/network/enums/method.enum.ts';
import EventEnum from './enums/event.enum.ts';

export type ControllerType = {
  key: KeyableType
  path: string
}

export type MethodType = {
  method: MethodEnum
  key: string
  path: string
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
  request?: RequestInterface | undefined
  response?: ResponseInterface | undefined
  socket?: WebSocket | undefined
  result?: any | undefined
}

export type NextFunctionType = () => Promise<void>

export type HttpMiddlewareHandlerType = (request: RequestInterface, response: ResponseInterface, url: URLPatternResult) => Promise<void>
export type SocketMiddlewareHandlerType = (socket: WebSocket, url: URLPatternResult) => Promise<void>

export default {}