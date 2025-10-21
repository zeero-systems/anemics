import type { AnnotationInterface, ArtifactType, DecorationType, DecoratorType } from '@zeero/commons';

import { AnnotationException, ConsumerAnnotation, Decorator, DecoratorKindEnum } from '@zeero/commons';

export class MiddlewareAnnotation implements AnnotationInterface {
  readonly name: string = 'Middleware'

  onAttach(artifact: ArtifactType, decorator: DecoratorType): any {
    if (decorator.decoration.kind == DecoratorKindEnum.CLASS) {
      Decorator.attach(artifact, { name: 'ConsumerAnnotation', target: new ConsumerAnnotation() }, decorator.decoration)

      const methodNames = ['onUse']

      for (const methodName of methodNames) {
        if (artifact.target.prototype[methodName]) {
          const onBootDecoration: DecorationType = {
            ...decorator.decoration, 
            kind: 'method', 
            property: methodName, 
            context: { 
              ...decorator.decoration.context, 
              name: methodName, 
              kind: 'method' 
            } as any 
          }
          Decorator.attach(artifact, { name: 'ConsumerAnnotation', target: new ConsumerAnnotation() }, onBootDecoration)
        }
      }

      return artifact.target;
    }

    if (decorator.decoration.kind == DecoratorKindEnum.METHOD) {
      Decorator.attach(artifact, { name: 'ConsumerAnnotation', target: new ConsumerAnnotation() }, decorator.decoration)

      return artifact.target;
    }

    throw new AnnotationException('Method not implemented for {name} on {kind}.', {
      key: 'NOT_IMPLEMENTED',
      context: { name: artifact.name, kind: decorator.decoration.kind },
    });
  }

  onInitialize(_artifact: ArtifactType, _decorator: DecoratorType) { }
}

export default MiddlewareAnnotation