import type { AnnotationInterface, ArtifactType, DecorationType, DecoratorFunctionType } from '@zxxxro/commons';
import { AnnotationException, Consumer, Decorator, DecoratorKindEnum, Mixin, Singleton } from '@zxxxro/commons';
import Endpoint from '~/controller/annotations/Endpoint.ts';

export class Controller implements AnnotationInterface {
  onAttach<P>(artifact: ArtifactType, decoration: DecorationType<P & { path?: string | undefined }>): any {
    if (decoration.kind == DecoratorKindEnum.CLASS) {            
      return Mixin([Consumer(), Endpoint(decoration.parameters?.path), Singleton()])(artifact.target, decoration.context);
    }

    throw new AnnotationException('Method not implemented for {name} on {kind}.', {
      key: 'NOT_IMPLEMENTED',
      context: { name: artifact.name, kind: decoration.kind },
    });
  }
}

export default (path?: string | undefined): DecoratorFunctionType => Decorator.apply(Controller, { path });
