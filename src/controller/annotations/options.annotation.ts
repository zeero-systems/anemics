import type { AnnotationInterface, ArtifactType, DecorationType, DecoratorFunctionType } from '@zxxxro/commons';

import { AnnotationException, Decorator, DecoratorKindEnum } from '@zxxxro/commons';

export class Options implements AnnotationInterface {
  onAttach<P>(artifact: ArtifactType, decoration: DecorationType<P & string>): any {
    if (decoration.kind == DecoratorKindEnum.METHOD) {
      return artifact.target;
    }

    throw new AnnotationException('Method not implemented for {name} on {kind}.', {
      key: 'NOT_IMPLEMENTED',
      context: { name: artifact.name, kind: decoration.kind },
    });
  }
}

export default (path?: string): DecoratorFunctionType => Decorator.apply(Options, { path });
