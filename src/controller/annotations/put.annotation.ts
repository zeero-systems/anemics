import type { AnnotationInterface, ArtifactType, DecoratorType, EntityInterface, NewableType } from '@zeero/commons';
import { AnnotationException, ConsumerAnnotation, Decorator, DecoratorKindEnum } from '@zeero/commons';
import { HttpAnnotationInterface } from '~/controller/interfaces.ts';

export class PutAnnotation implements AnnotationInterface, HttpAnnotationInterface {
  name: string = 'Put';

  constructor(public path?: string, public entity?: NewableType<new (...args: any[]) => EntityInterface>) {}

  onAttach(artifact: ArtifactType, decorator: DecoratorType): any {
    if (decorator.decoration.kind == DecoratorKindEnum.METHOD) {
      const consumer = new ConsumerAnnotation();
      Decorator.attach(artifact, { name: 'ConsumerAnnotation', target: consumer }, decorator.decoration);
      return artifact.target;
    }

    throw new AnnotationException('Method not implemented for {name} on {kind}.', {
      key: 'NOT_IMPLEMENTED',
      context: { name: artifact.name, kind: decorator.decoration.kind },
    });
  }

  onInitialize(_artifact: ArtifactType, _decorator: DecoratorType) {}
}

export default PutAnnotation;
