import type { AnnotationInterface, ArtifactType, DecorationType, DecoratorFunctionType } from '@zxxxro/commons';
import { ParameterType } from '~/controller/types.ts';

import { AnnotationException, Annotations, Decorator, DecoratorKindEnum, Entity, Factory } from '@zxxxro/commons';

import Gateway from '~/controller/services/gateway.service.ts';
import isMethod from '~/bootstraper/guards/is-method.guard.ts';

export class Endpoint extends Entity implements AnnotationInterface {
  onAttach<P>(artifact: ArtifactType, decoration: DecorationType<P & { path?: string | undefined }>): any {
    if (decoration.kind == DecoratorKindEnum.CLASS) {
      if (!Decorator.hasAnnotation(artifact.target, Annotations.Singleton)) {
        const decorationMap = decoration.context.metadata[Decorator.metadata];

        const properties = [...Object.getOwnPropertyNames(artifact.target.prototype), 'constructor'];
        const methods = ['Get', 'Post', 'Put', 'Patch', 'Options', 'Delete'];

        for (const propertyKey of properties) {
          if (decorationMap.has(propertyKey)) {
            const decorationsMap: DecorationType<any>[] = decorationMap.get(propertyKey);

            for (const decorationMap of decorationsMap) {
              if (methods.includes(decorationMap.annotation.constructor.name)) {
                const controllerMethod = String(decorationMap.annotation.constructor.name).toUpperCase();

                if (isMethod(controllerMethod)) {
                  Gateway.add(controllerMethod, {
                    controller: {
                      path: decoration.parameters?.path ?? '',
                      target: artifact.target,
                    },
                    handler: {
                      path: decorationMap.parameters.path ?? '',
                      method: controllerMethod,
                      pattern: new URLPattern({
                        pathname: `/${decoration.parameters?.path}${
                          decorationMap.parameters.path ? `/${decorationMap.parameters.path}` : ''
                        }`,
                      }),
                      propertyKey,
                      parameterNames: Factory.getParameterNames(
                        artifact.target.prototype[propertyKey],
                        propertyKey,
                      ) as ParameterType[],
                      paremeterValues: []
                    },
                  });
                }
              }
            }
          }
        }
      }

      return artifact.target;
    }

    throw new AnnotationException('Method not implemented for {name} on {kind}.', {
      key: 'NOT_IMPLEMENTED',
      context: { name: artifact.name, kind: decoration.kind },
    });
  }
}

export default (path?: string | undefined): DecoratorFunctionType => Decorator.apply(Endpoint, { path });
