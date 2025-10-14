import type { AnnotationInterface, ArtifactType, DecoratorType } from '@zeero/commons';
import type { GeometricOptionsType, GeometricType } from '~/storer/types.ts';
import type { ColumnInterface } from '~/storer/interfaces.ts';

import { AnnotationException, DecoratorKindEnum } from '@zeero/commons';

export class GeometricAnnotation implements AnnotationInterface, ColumnInterface {
  name: string = 'Geometric'
  persists?: boolean | undefined = true
  stackable?: boolean | undefined = false
    
  constructor(public type: GeometricType, public options?: GeometricOptionsType) {}

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

export default GeometricAnnotation
