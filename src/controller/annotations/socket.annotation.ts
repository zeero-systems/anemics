import type { AnnotationInterface, ArtifactType, DecoratorType } from '@zeero/commons';
import { AnnotationException, ConsumerAnnotation, Decorator, DecoratorKindEnum } from '@zeero/commons';
import { SocketAnnotationInterface } from '~/controller/interfaces.ts';

export class SocketAnnotation implements AnnotationInterface, SocketAnnotationInterface {
  name: string = 'Socket';

  constructor(public namespace?: string) {}

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

export default SocketAnnotation;
