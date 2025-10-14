import type { AnnotationInterface, ArtifactType, DecoratorType } from '@zeero/commons';
import type { CharacterOptionsType, CharacterType } from '~/storer/types.ts';
import type { ColumnInterface } from '~/storer/interfaces.ts';

import { AnnotationException, DecoratorKindEnum } from '@zeero/commons';

export class CharacterAnnotation implements AnnotationInterface, ColumnInterface {
  name: string = 'Character'
  persists?: boolean | undefined = true
  stackable?: boolean | undefined = false
    
  constructor(public type: CharacterType, public options?: CharacterOptionsType) {}

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

export default CharacterAnnotation
