import type { AnnotationInterface, ArtifactType, DecoratorType } from '@zeero/commons';
import type { NetworkOptionsType, NetworkType } from '~/storer/types.ts';
import type { ColumnInterface } from '~/storer/interfaces.ts';

import { AnnotationException, DecoratorKindEnum } from '@zeero/commons';

export class NetworkAnnotation implements AnnotationInterface, ColumnInterface {
  name: string = 'Network'
  persists?: boolean | undefined = true
  stackable?: boolean | undefined = false
    
  constructor(public type: NetworkType, public options?: NetworkOptionsType) {}

  onAttach(artifact: ArtifactType, decorator: DecoratorType): any {
    if (
      decorator.decoration.kind == DecoratorKindEnum.FIELD ||
      decorator.decoration.kind == DecoratorKindEnum.ACCESSOR
    ) {
      return artifact.target;
    }

    throw new AnnotationException('Method not implemented for {name} on {kind}.', {
      key: 'NOT_IMPLEMENTED',
      context: { name: artifact.name, kind: decorator.decoration.kind },
    });
  }

  onInitialize(_artifact: ArtifactType, _decorator: DecoratorType) { }
}

export default NetworkAnnotation
