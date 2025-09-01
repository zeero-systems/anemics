import type { AnnotationInterface } from '~/decorator/interfaces.ts';
import type { DecorationType, DecoratorFunctionType } from '~/decorator/types.ts';
import type { ArtifactType, ConstructorType, KeyType } from '~/common/types.ts';

import AnnotationException from '~/decorator/exceptions/AnnotationException.ts';
import Decorator from '~/decorator/services/Decorator.ts';
import DecoratorKindEnum from '~/decorator/enums/DecoratorKindEnum.ts';
import ScopeEnum from '~/container/enums/ScopeEnum.ts';

export class Consume implements AnnotationInterface {
  onAttach<P>(artifact: ArtifactType, decoration: DecorationType<P>): any {
    if (
      decoration.kind == DecoratorKindEnum.ACCESSOR ||
      decoration.kind == DecoratorKindEnum.FIELD
    ) {
      return artifact.target;
    }

    throw new AnnotationException('Method not implemented for {name} on {kind}.', {
      key: 'NOT_IMPLEMENTED',
      context: { name: artifact.name, kind: decoration.kind },
    });
  }
}

export default (provider?: ConstructorType<any> | KeyType, scope: ScopeEnum = ScopeEnum.Transient): DecoratorFunctionType => Decorator.apply(Consume, { parameters: { scope, provider }, persists: true });
