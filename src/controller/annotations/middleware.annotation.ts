import type { ActionType, EventType, OptionsType } from '~/controller/types.ts';
import type { AnnotationInterface, ArtifactType, DecorationType, DecoratorFunctionType } from '@zxxxro/commons';

import { Annotations, AnnotationException, Consumer, Mixin, Decorator, Singleton, DecoratorKindEnum } from '@zxxxro/commons';
import Interceptor from '~/controller/services/interceptor.service.ts';

export class Middleware implements AnnotationInterface {
  onAttach<P>(artifact: ArtifactType, decoration: DecorationType<P & OptionsType>): any {
    if (decoration.kind == DecoratorKindEnum.CLASS) {
      
      if (!Decorator.hasAnnotation(artifact.target, Annotations.Singleton)) {
        artifact.target = new Proxy(artifact.target, {
          construct(currentTarget, currentArgs, newTarget) {
            if (currentTarget.prototype !== newTarget.prototype) {
              return Reflect.construct(currentTarget, currentArgs, newTarget);
            }

            const instance = Reflect.construct(currentTarget, currentArgs, newTarget);
            
            Reflect.defineProperty(instance, 'event', {
              enumerable: true,
              value: decoration.parameters?.event
            })
            Reflect.defineProperty(instance, 'action', {
              enumerable: true,
              value: decoration.parameters?.action
            })
            
            return instance
          },
        });

        artifact.target.toString = Function.prototype.toString.bind(artifact.target);
        artifact.target = Mixin([Consumer(), Singleton()])(artifact.target, decoration.context);

        Interceptor.add(artifact.target)
      }

      return artifact.target
    }

    throw new AnnotationException('Method not implemented for {name} on {kind}.', {
      key: 'NOT_IMPLEMENTED',
      context: { name: artifact.name, kind: decoration.kind },
    });
  }
}

export default (event: EventType = 'middle', action: ActionType = 'last'): DecoratorFunctionType => Decorator.apply(Middleware, { event, action });
