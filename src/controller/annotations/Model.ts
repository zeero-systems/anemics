import type { AnnotationInterface, ArtifactType, DecorationType, DecoratorFunctionType } from '@zxxxro/commons';

import { AnnotationException, Common, Decorator, DecoratorKindEnum, Metadata, Text } from '@zxxxro/commons';
import Framer from '~/controller/services/Framer.ts';

export class Model implements AnnotationInterface {
  onAttach<P>(artifact: ArtifactType, decoration: DecorationType<P>): any {
    if (decoration.kind == DecoratorKindEnum.CLASS) {
      if (!Metadata.getProperty(artifact.target, Common.singleton)) {
        Framer.set(Text.toFirstLetterUppercase(artifact.name), artifact.target);
      }
      
      return artifact.target;
    }

    throw new AnnotationException('Method not implemented for {name} on {kind}.', {
      key: 'NOT_IMPLEMENTED',
      context: { name: artifact.name, kind: decoration.kind },
    });
  }
}

export default (): DecoratorFunctionType => Decorator.apply(Model);
