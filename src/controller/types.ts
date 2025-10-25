import type { ContainerInterface, DecoratorType, EntityInterface, KeyableType, NewableType, SpanInterface } from '@zeero/commons';
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
  key: string
  path: string
  namespace: string 
  method: MethodEnum | string
  entity?: NewableType<new (...args: any[]) => EntityInterface>,
  filter?: FilterType,
}


export type MiddlerType = { [key in EventType]: Array<MiddlewareInterface> }

export type RouteType = {
  key: string
  wired: { try: NextFunctionType, catch: NextFunctionType }
  action: ActionType
  controller: ControllerType
  pattern?: URLPattern
  pathname?: string
  decorators: Array<DecoratorType>
}

export type EventType = `${EventEnum}`

export type ContextType<T = BodyInit> = {
  handler: HandlerType
  requester: RequesterInterface<T>
  responser: ResponserInterface
  container: ContainerInterface
  route: RouteType
  server: ServerOptionsType
  span: SpanInterface
}

export type NextFunctionType = (context?: ContextType) => Promise<void>

export default {}