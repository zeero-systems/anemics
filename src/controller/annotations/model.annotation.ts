import type { AnnotationInterface, ArtifactType, DecorationType, DecoratorFunctionType } from '@zxxxro/commons';

import { AnnotationException, Artifactor, Decorator, DecoratorKindEnum, ScopeEnum, Scoper } from '@zxxxro/commons';

export class Model implements AnnotationInterface {
  public static readonly tag: unique symbol = Symbol('Model.tag');

  onAttach<P>(artifact: ArtifactType, decoration: DecorationType<P>): any {
    if (decoration.kind == DecoratorKindEnum.CLASS) {
      if (!Decorator.hasAnnotation(artifact.target, Model)) {
        Artifactor.set(artifact.name, {
          name: artifact.name,
          target: artifact.target,
          tags: [Model.tag],
        });

        Scoper.setDecoration(ScopeEnum.Ephemeral, decoration);
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
