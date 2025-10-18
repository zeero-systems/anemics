import { ArtifactType, Decorator, DecoratorMetadata, Text } from '@zeero/commons';

import type { RouterInterface } from '~/controller/interfaces.ts';
import type { RouteType, ControllerType, MethodType } from '~/controller/types.ts';

import MethodEnum from '~/network/enums/method.enum.ts';
import ControllerAnnotation from '~/controller/annotations/controller.annotation.ts';

import isMethod from '~/controller/guards/is-http.guard.ts';
import isSocket from '~/controller/guards/is-socket.guard.ts';

export class Router implements RouterInterface {
  static actions: Array<MethodEnum> = Object.values(MethodEnum)
  
  public routes: { [key in MethodEnum]: Array<RouteType> } = Router.actions
    .reduce((prev, curr: any) => { prev[curr] = []; return prev }, {} as any)

  constructor(artifacts: Array<ArtifactType>) {
    for (let index = 0; index < artifacts.length; index++) {
      const artifact = artifacts[index];

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

        for (let index = 0; index < methodDecorators.length; index++) {
          const decorator = methodDecorators[index];
          const method = String(decorator.annotation.target.name).toLowerCase()
          const key = `${String(targetName)}:${String(decorator.decoration.property)}`
          
          if (isMethod(decorator.annotation.target)) {
            const action = {
              key: String(decorator.decoration.property),
              path: decorator.annotation.target.path || '',
              method: method,
              decorators: DecoratorMetadata.filterByTargetPropertyKeys(artifact.target, [String(decorator.decoration.property)])
            } as MethodType
            
            const pathname = `${controller.path}${action.path}`

            const pattern = new URLPattern({ pathname });

            this.routes[action.method].push({ key, action, controller, pattern, pathname });
          }

          if (isSocket(decorator.annotation.target)) {
            const action = {
              key: String(decorator.decoration.property),
              namespace: decorator.annotation.target.namespace || '',
            } as any

            const pathname = `${controller.path}${action.namespace}`

            this.routes[MethodEnum.SOCKET].push({ key, action, controller, pathname });
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
