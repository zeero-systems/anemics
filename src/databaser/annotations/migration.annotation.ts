import type { AnnotationInterface, ArtifactType, DecorationType, DecoratorFunctionType } from '@zxxxro/commons';

import { AnnotationException, Artifactor, Decorator, DecoratorKindEnum } from '@zxxxro/commons';

export class Migration implements AnnotationInterface {
  static readonly tag: unique symbol = Symbol('Migration.tag')

  onAttach<P>(artifact: ArtifactType, decoration: DecorationType<P & string>): any {
    if (decoration.kind == DecoratorKindEnum.CLASS) {
      
      if (!Decorator.hasAnnotation(artifact.target, Migration)) {
        Artifactor.set(artifact.name, {
          name: artifact.name,
          target: artifact.target,
          tags: [ Migration.tag ]
        });
      }     
      
      return artifact.target;
    }

    throw new AnnotationException('Method not implemented for {name} on {kind}.', {
      key: 'NOT_IMPLEMENTED',
      context: { name: artifact.name, kind: decoration.kind },
    });
  }
}

export default (): DecoratorFunctionType => Decorator.apply(Migration);
