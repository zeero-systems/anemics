import type { ContainerInterface, DecoratorType, EntityInterface, KeyableType, NewableType } from '@zeero/commons';
import type { RequesterInterface, ResponserInterface } from '~/network/interfaces.ts';
import type { FilterType } from '~/persister/types.ts';
import type { MiddlewareInterface } from '~/controller/interfaces.ts';
import type { ServerOptionsType } from '~/network/types.ts';
import type { HandlerType } from '~/entrypoint/types.ts';

import MethodEnum from '~/network/enums/method.enum.ts';
import EventEnum from '~/controller/enums/event.enum.ts';

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

export type MiddlerType = { [key in EventType]: Array<MiddlewareInterface> }

export type DuplexType = ActionType & { 
  key: string; 
  namespace: string 
}

export type RouteType = {
  key: string
  wired: { try: NextFunctionType, catch: NextFunctionType }
  action: MethodType | DuplexType
  controller: ControllerType
  pattern?: URLPattern
  pathname?: string
  decorators: Array<DecoratorType>
}

export type EventType = `${EventEnum}`

export type ContextType = {
  handler: HandlerType
  requester: RequesterInterface
  responser: ResponserInterface
  container: ContainerInterface
  route: RouteType
  server: ServerOptionsType
  url: URLPatternResult
}

export type NextFunctionType = (context?: ContextType) => Promise<void>

export default {}