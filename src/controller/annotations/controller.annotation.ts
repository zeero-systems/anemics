import type { AnnotationInterface, ArtifactType, DecoratorType } from '@zeero/commons';
import type { HttpAnnotationInterface } from '~/controller/interfaces.ts';

import { AnnotationException, DecoratorKindEnum } from '@zeero/commons';

export class ControllerAnnotation implements AnnotationInterface, HttpAnnotationInterface {
  name: string = 'Controller';

  constructor(public path: string = '') {}

  onAttach(artifact: ArtifactType, decorator: DecoratorType): any {
    if (decorator.decoration.kind == DecoratorKindEnum.CLASS) {
      return artifact.target;
    }

    throw new AnnotationException('Method not implemented for {name} on {kind}.', {
      key: 'NOT_IMPLEMENTED',
      context: { name: artifact.name, kind: decorator.decoration.kind },
    });
  }

  onInitialize(_artifact: ArtifactType, _decorator: DecoratorType) {}
}

export default ControllerAnnotation;
