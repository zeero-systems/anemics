import type { FilterType } from '~/persister/types.ts';
import type { AnnotationInterface, ArtifactType, DecoratorType } from '@zeero/commons';
import type { HttpAnnotationInterface } from '~/controller/interfaces.ts';

import { AnnotationException, ConsumerAnnotation, Decorator, DecoratorKindEnum } from '@zeero/commons';
import ActionEnum from '~/network/enums/method.enum.ts';

export class GetAnnotation implements AnnotationInterface, HttpAnnotationInterface {
  name: string = ActionEnum.GET

  constructor(public path?: string, public filter?: FilterType) {}

  onAttach(artifact: ArtifactType, decorator: DecoratorType): any{
    if (decorator.decoration.kind == DecoratorKindEnum.METHOD) {
      const consumer = new ConsumerAnnotation()
      Decorator.attach(artifact, { name: 'ConsumerAnnotation', target: consumer }, decorator.decoration)
      return artifact.target;
    }
    
    throw new AnnotationException('Method not implemented for {name} on {kind}.', {
      key: 'NOT_IMPLEMENTED',
      context: { name: artifact.name, kind: decorator.decoration.kind },
    });
  }

  onInitialize(_artifact: ArtifactType, _decorator: DecoratorType) { }
}

export default GetAnnotation
