import type { AnnotationInterface, ArtifactType, DecorationType } from '@zxxxro/commons';

import { AnnotationException, Decorator, DecoratorKindEnum } from '@zxxxro/commons';

export class Virtual implements AnnotationInterface {
  onAttach<P>(artifact: ArtifactType, decoration: DecorationType<P & string>): any {
    if (decoration.kind == DecoratorKindEnum.FIELD) {
      return artifact.target;
    }

    throw new AnnotationException('Method not implemented for {name} on {kind}.', {
      key: 'NOT_IMPLEMENTED',
      context: { name: artifact.name, kind: decoration.kind },
    });
  }
}

export default (query?: (alias: string) => string) => Decorator.apply(Virtual, { query });
