import type { ActionType, EventType, OptionsType } from '~/controller/types.ts';
import type { AnnotationInterface, ArtifactType, DecorationType, DecoratorFunctionType } from '@zxxxro/commons';

import { Annotations, AnnotationException, Consumer, Mixin, Decorator, Singleton, DecoratorKindEnum } from '@zxxxro/commons';
import Interceptor from '~/controller/services/interceptor.service.ts';

export class Middleware implements AnnotationInterface {
  onAttach<P>(artifact: ArtifactType, decoration: DecorationType<P & OptionsType>): any {
    if (decoration.kind == DecoratorKindEnum.CLASS) {
      
      if (!Decorator.hasAnnotation(artifact.target, Annotations.Singleton)) {
        artifact.target = Mixin([Consumer(), Singleton()])(artifact.target, decoration.context);

        // @ts-ignore we aways will have this parameters
        Interceptor.add(artifact.target, decoration.parameters)
      }

      return artifact.target
    }

    throw new AnnotationException('Method not implemented for {name} on {kind}.', {
      key: 'NOT_IMPLEMENTED',
      context: { name: artifact.name, kind: decoration.kind },
    });
  }
}

export default (event: EventType = 'then', action: ActionType = 'last', weight: number = 0): DecoratorFunctionType => Decorator.apply(Middleware, { event, action, weight });
