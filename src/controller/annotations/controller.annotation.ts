import type { 
  AnnotationInterface, 
  ArtifactType, 
  DecorationType, 
  DecoratorFunctionType 
} from '@zxxxro/commons';

import { 
  AnnotationException, 
  Consumer, 
  Decorator, 
  DecoratorKindEnum, 
  Mixin, 
  Scope,
  ScopeEnum 
} from '@zxxxro/commons';

import Endpoint from '~/controller/annotations/endpoint.annotation.ts';

export class Controller implements AnnotationInterface {
  static readonly tag: unique symbol = Symbol('Controller.tag')

  onAttach<P>(artifact: ArtifactType, decoration: DecorationType<P & { path?: string | undefined, scope: ScopeEnum }>): any {
    if (decoration.kind == DecoratorKindEnum.CLASS) {
      return Mixin([
        Consumer(), 
        Scope(decoration.parameters?.scope),
        Endpoint(decoration.parameters?.path)
      ])(artifact.target, decoration.context);
    }

    throw new AnnotationException('Method not implemented for {name} on {kind}.', {
      key: 'NOT_IMPLEMENTED',
      context: { name: artifact.name, kind: decoration.kind },
    });
  }
}

export default (path?: string | undefined, scope: ScopeEnum = ScopeEnum.Transient): DecoratorFunctionType => Decorator.apply(Controller, { path, scope });
