import type { AnnotationInterface, ArtifactType, DecoratorType } from '@zeero/commons';
import type { StructureType } from '~/querier/types.ts';
import type { ColumnOptionsType } from '~/persister/types.ts';
import type { ColumnInterface } from '~/persister/interfaces.ts';

import { AnnotationException, DecoratorKindEnum } from '@zeero/commons';

export class StructureAnnotation implements AnnotationInterface, ColumnInterface {
  name: string = 'Structure';
  persists?: boolean | undefined = true;
  stackable?: boolean | undefined = false;

  constructor(public type: StructureType, public options?: ColumnOptionsType & { enums?: any[] }) {}

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

  onInitialize(_artifact: ArtifactType, _decorator: DecoratorType) {}
}

export default StructureAnnotation;
