import type { FilterType } from '~/persister/types.ts';
import type { RouteType, ContextType, NextFunctionType, EventType } from '~/controller/types.ts';

import MethodEnum from '~/network/enums/method.enum.ts';
import EventEnum from '~/controller/enums/event.enum.ts';
import { EntityInterface, NewableType } from '@zeero/commons';

export interface ControllerInterface {}

export interface RouterInterface {
  routes: { [key in MethodEnum]: Array<RouteType> }

  find(url: string, method: MethodEnum): RouteType | undefined
}

export interface MiddlewareInterface {
  name: string
  event: EventType
  onUse(context: ContextType, next: NextFunctionType): Promise<void>
}

export interface MiddlerInterface {
  middlewares: { [key: string]: { [key in EventType]: Array<MiddlewareInterface> } }
  
  filter(event: EventEnum, key: string): Array<MiddlewareInterface>
}

export interface HttpAnnotationInterface {
  path?: string
  filter?: FilterType
  entity?: NewableType<new (...args: any[]) => EntityInterface>
} 

export interface SocketAnnotationInterface {
  namespace?: string
  filter?: FilterType
  entity?: NewableType<new (...args: any[]) => EntityInterface>
}


export default {}