import type { EventType, OptionsType } from '~/controller/types.ts';
import type { AnnotationInterface, ArtifactType, DecorationType, DecoratorFunctionType } from '@zxxxro/commons';

import {
  AnnotationException,
  Annotations,
  Artifactor,
  Decorator,
  DecoratorKindEnum,
  ScopeEnum,
  Scoper,
} from '@zxxxro/commons';
import Interceptor from '~/controller/services/interceptor.service.ts';

export class Intercept implements AnnotationInterface {
  onAttach<P>(artifact: ArtifactType, decoration: DecorationType<P & OptionsType>): any {
    if (decoration.kind == DecoratorKindEnum.CLASS) {
      if (!Decorator.hasAnnotation(artifact.target, Intercept)) {

        if (decoration.parameters) {
          Artifactor.set(artifact.name, {
            name: artifact.name,
            target: artifact.target,
            tags: [
              Annotations.Consumer.tag, 
              Interceptor.tag, 
              Interceptor[`${decoration.parameters.event}Tag`]
            ],
          });
  
          Scoper.setDecoration(ScopeEnum.Perpetual, decoration);
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

export default (event: EventType = 'then', weight: number = 0): DecoratorFunctionType => Decorator.apply(Intercept, { event, weight });
