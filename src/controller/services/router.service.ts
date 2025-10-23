import { ArtifactType, DecoratorMetadata, Dispatcher, DispatcherInterface, Text } from '@zeero/commons';

import type { RouterInterface } from '~/controller/interfaces.ts';
import type { RouteType, ControllerType, ContextType, ActionType } from '~/controller/types.ts';

import MethodEnum from '~/network/enums/method.enum.ts';
import ControllerAnnotation from '~/controller/annotations/controller.annotation.ts';

import isHttp from '~/controller/guards/is-http.guard.ts';
import isSocket from '~/controller/guards/is-socket.guard.ts';

export class Router implements RouterInterface {
  static actions: Array<MethodEnum> = Object.values(MethodEnum)
  size: number = 0
  
  public dispatcher: DispatcherInterface<{ routed: [RouteType] }> = new Dispatcher<{ routed: [RouteType] }>();

  public routes: { [key in MethodEnum | string]: Array<RouteType> } = Router.actions
    .reduce((prev, curr: any) => { prev[curr] = []; return prev }, {} as any)

  constructor() {}

  public routerify(artifacts: Array<ArtifactType>): void {
    for (const artifact of artifacts) {
      const controllerDecorator = DecoratorMetadata.findByAnnotationInteroperableName(
        artifact.target,
        'Controller',
      );
      const methodDecorators = DecoratorMetadata.filterByAnnotationInteroperableNames(
        artifact.target,
        Router.actions.map((method) => Text.toFirstLetterUppercase(method)),
      );

      if (controllerDecorator && methodDecorators.length > 0) {
        const targetName = artifact.name;
        const controllerAnnotation = controllerDecorator.annotation.target as ControllerAnnotation;
        const controller: ControllerType = { path: controllerAnnotation.path, key: targetName };

        for (let jindex = 0; jindex < methodDecorators.length; jindex++) {
          const decorator = methodDecorators[jindex];
          const propertyName = String(decorator.decoration.property)
          const method = String(decorator.annotation.target.name).toLowerCase()
          const key = `${String(targetName)}:${propertyName}`
          const decorators = DecoratorMetadata.filterByTargetPropertyKeys(artifact.target, [propertyName])
          
          if (isHttp(decorator.annotation.target)) {
            const action: ActionType = {
              key: String(decorator.decoration.property),
              path: decorator.annotation.target.path || '',
              method: method,
              namespace: '',
              entity: decorator.annotation.target.entity,
              filter: decorator.annotation.target.filter,
            } as RouteType['action']
            
            const pathname = `${controller.path}${action.path}`

            const pattern = new URLPattern({ pathname });

            const wired = { try: async (_context?: ContextType) => {}, catch: async (_context?: ContextType) => {} }
            const route = { 
              key, 
              action, 
              controller, 
              pattern, 
              pathname,
              decorators,
              wired
            }

            this.size++
            this.routes[action.method].push(route);
            this.dispatcher.dispatch('routed', route)
          }

          if (isSocket(decorator.annotation.target)) {
            const action: ActionType = {
              key: String(decorator.decoration.property),
              path: '',
              method: '',
              namespace: decorator.annotation.target.namespace || '',
              entity: decorator.annotation.target.entity,
              filter: decorator.annotation.target.filter,
            }

            const pathname = `${controller.path}${action.namespace}`

            const wired = { try: async (_context?: ContextType) => {}, catch: async (_context?: ContextType) => {} }

            const route = { 
              key, 
              action, 
              controller, 
              pathname,
              decorators,
              wired
            }

            this.size++
            this.routes[MethodEnum.SOCKET].push(route);
            this.dispatcher.dispatch('routed', route)
          }
        }
      }
    }
  }

  public find(url: string, method: MethodEnum): RouteType | undefined {
    return this.routes[method].find((route) => route.pattern?.test(url))
  }
}

export default Router;
