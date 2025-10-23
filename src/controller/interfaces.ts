import type { FilterType } from '~/persister/types.ts';
import type { RouteType, EventType, MiddlerType, ContextType, NextFunctionType } from '~/controller/types.ts';

import MethodEnum from '~/network/enums/method.enum.ts';
import { ArtifactType, DispatcherInterface, EntityInterface, NewableType } from '@zeero/commons';

export interface ControllerInterface {}

export interface RouterInterface {
  size: number
  routes: { [key in MethodEnum | string]: Array<RouteType> }
  dispatcher: DispatcherInterface<{ routed: [RouteType] }>

  find(url: string, method: MethodEnum): RouteType | undefined
  routerify(artifacts: Array<ArtifactType>): void
}

export interface MiddlewareInterface {
  events: Array<EventType>
  onUse(context: ContextType, next: NextFunctionType): Promise<void>
}

export interface MiddlerInterface {
  middlewares: { [key: string]: MiddlerType }

  wirefy(artifacts: Array<ArtifactType>): void
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