import type { AnnotationInterface, ArtifactType, DecoratorType } from '@zeero/commons';
import type { ContextType, EventType, NextFunctionType } from '~/controller/types.ts';
import type { ControllerInterface, HttpAnnotationInterface, MiddlewareInterface } from '~/controller/interfaces.ts';

import { AnnotationException, DecoratorKindEnum } from '@zeero/commons';

export class ControllerAnnotation implements AnnotationInterface, HttpAnnotationInterface, MiddlewareInterface {
  name: string = 'Controller';
  events: Array<EventType> = ['middle']
  static readonly metadata: unique symbol = Symbol('Controller.metadata');

  constructor(public path: string = '') {}

  async onUse(context: ContextType, next: NextFunctionType): Promise<void> {
    if (context.responser) {
      const body = await (context.container.construct<ControllerInterface>(context.route.controller.key) as any)[context.route.action.key]()

      if (body) context.responser.body = body
    }

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
