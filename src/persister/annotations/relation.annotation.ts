import type { AnnotationInterface, ArtifactType, DecoratorType, NewableType } from '@zeero/commons';
import type { RelationOptionsType } from '~/persister/types.ts';
import type { RelationInterface } from '~/persister/interfaces.ts';

import { AnnotationException, DecoratorKindEnum } from '@zeero/commons';

export class RelationAnnotation implements AnnotationInterface, RelationInterface {
  name: string = 'Relation';
  persists?: boolean | undefined = true;
  stackable?: boolean | undefined = false;

  constructor(public referenceTable: () => NewableType<any>, public options: RelationOptionsType) {}

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

export default RelationAnnotation;
