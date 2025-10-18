import type { AnnotationInterface, ArtifactType, DecoratorType } from '@zeero/commons';
import type { ContextType, MiddlewareEventType, NextFunctionType } from '~/controller/types.ts';
import type { ControllerInterface, HttpAnnotationInterface, MiddlewareInterface } from '~/controller/interfaces.ts';

import { AnnotationException, DecoratorKindEnum } from '@zeero/commons';

export class ControllerAnnotation implements AnnotationInterface, HttpAnnotationInterface, MiddlewareInterface {
  name: string = 'Controller';
  event: MiddlewareEventType = 'middle'
  static readonly metadata: unique symbol = Symbol('Controller.metadata');

  constructor(public path: string = '') {}

  async onUse(context: ContextType, next: NextFunctionType): Promise<void> {
    context.result = await (context.container.construct<ControllerInterface>(context.route.controller.key) as any)[context.route.action.key]()

    next()
  }

  onAttach(artifact: ArtifactType, decorator: DecoratorType): any {
    if (decorator.decoration.kind == DecoratorKindEnum.CLASS) {
      return artifact.target
    }

    throw new AnnotationException('Method not implemented for {name} on {kind}.', {
      key: 'NOT_IMPLEMENTED',
      context: { name: artifact.name, kind: decorator.decoration.kind },
    });
  }

  onInitialize(_artifact: ArtifactType, _decorator: DecoratorType) {}
}

export default ControllerAnnotation;
