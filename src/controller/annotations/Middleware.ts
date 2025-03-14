import type { MiddlewarePositionType } from '~/controller/types.ts';
import type { AnnotationInterface, ArtifactType, DecorationType, DecoratorFunctionType } from '@zxxxro/commons';

import { AnnotationException, Common, Decorator, DecoratorKindEnum, Entity, Metadata } from '@zxxxro/commons';

import Interceptor from '~/controller/services/Interceptor.ts'

export class Middleware extends Entity implements AnnotationInterface {
  onAttach<P>(artifact: ArtifactType, decoration: DecorationType<P & MiddlewarePositionType>): any {
    if (decoration.kind == DecoratorKindEnum.CLASS) {
      if (!Metadata.getProperty(artifact.target, Common.singleton)) {
        // @ts-ignore all the positions are known functions
        Interceptor[decoration.parameters](artifact.target);
      }
      
      return artifact.target;
    }

    throw new AnnotationException('Method not implemented for {name} on {kind}.', {
      key: 'NOT_IMPLEMENTED',
      context: { name: artifact.name, kind: decoration.kind },
    });
  }
}

export default (position: MiddlewarePositionType = 'last'): DecoratorFunctionType => Decorator.apply(Middleware, position);
