import type { AnnotationInterface, ArtifactType, DecoratorType } from '@zeero/commons';
import { AnnotationException, ConsumerAnnotation, Decorator, DecoratorKindEnum } from '@zeero/commons';
import { HttpAnnotationInterface } from '~/controller/interfaces.ts';
import ActionEnum from '~/network/enums/method.enum.ts';

export class TraceAnnotation implements AnnotationInterface, HttpAnnotationInterface {
  name: string = ActionEnum.TRACE

  constructor(public path?: string) {}

  onAttach(artifact: ArtifactType, decorator: DecoratorType): any{
    if (decorator.decoration.kind == DecoratorKindEnum.METHOD) {
      const consumer = new ConsumerAnnotation()
      Decorator.attach(artifact, { name: consumer.name, target: consumer }, decorator.decoration)
      return artifact.target;
    }
    
    throw new AnnotationException('Method not implemented for {name} on {kind}.', {
      key: 'NOT_IMPLEMENTED',
      context: { name: artifact.name, kind: decorator.decoration.kind },
    });
  }

  onInitialize(_artifact: ArtifactType, _decorator: DecoratorType) { }
}

export default TraceAnnotation
