import type { AnnotationInterface } from '~/decorator/interfaces.ts';
import type { DecorationType, DecoratorFunctionType } from '~/decorator/types.ts';
import type { ArtifactType } from '~/common/types.ts';

import AnnotationException from '~/decorator/exceptions/AnnotationException.ts';
import Artifactory from '~/common/services/Artifactory.ts';
import Decorator from '~/decorator/services/Decorator.ts';
import DecoratorKindEnum from '~/decorator/enums/DecoratorKindEnum.ts';
import Text from '~/common/services/Text.ts';
import Scoper from '~/container/services/Scoper.ts';
import ScopeEnum from '~/container/enums/ScopeEnum.ts';

export class Consumer implements AnnotationInterface {
  static readonly tag: unique symbol = Symbol('Consumer.tag')

  onAttach<P>(artifact: ArtifactType, decoration: DecorationType<P & { scope: ScopeEnum }>): any {
    if (decoration.kind == DecoratorKindEnum.CLASS) {
      const scope = decoration.settings?.scope || ScopeEnum.Transient
      const targetName = Text.toFirstLetterUppercase(artifact.name)

      Artifactory.set(targetName, Consumer.tag, artifact)

      Scoper.setDecoration(scope, decoration)

      return artifact.target;
    }

    throw new AnnotationException('Method not implemented for {name} on {kind}.', {
      key: 'NOT_IMPLEMENTED',
      context: { name: artifact.name, kind: decoration.kind },
    });
  }
}

export default (): DecoratorFunctionType => Decorator.apply(Consumer);
