import type { FilterType } from '~/persister/types.ts';
import type { RouteType, EventType, MiddlerType, ContextType, NextFunctionType } from '~/controller/types.ts';

import MethodEnum from '~/network/enums/method.enum.ts';
import { ArtifactType, EntityInterface, NewableType } from '@zeero/commons';

export interface ControllerInterface {}

export interface RouterInterface {
  routes: { [key in MethodEnum]: Array<RouteType> }

  find(url: string, method: MethodEnum): RouteType | undefined
}

export interface MiddlewareInterface {
  events: Array<EventType>
  onUse(context: ContextType, next: NextFunctionType): Promise<void>
}

export interface MiddlerInterface {
  middlewares: { [key: string]: MiddlerType }

  add(artifacts: Array<ArtifactType>): void
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