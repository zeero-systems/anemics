import type { AnnotationInterface, ArtifactType, DecoratorType } from '@zeero/commons';
import type { ControllerInterface, MiddlewareInterface } from '~/controller/interfaces.ts';
import type { ContextType, EventType, NextFunctionType } from '~/controller/types.ts';

export class GatewayMiddleware implements MiddlewareInterface, AnnotationInterface {
  name: string = 'Gateway';
  events: Array<EventType> = ['middle'];

  async onUse(context: ContextType, next: NextFunctionType): Promise<void> {
    if (context.responser) {
      const body = await (context.container.construct<ControllerInterface>(context.route.controller.key) as any)
        [context.route.action.key]();

      if (body) context.responser.body = body;
    }

    return next();
  }

  onAttach(_artifact: ArtifactType, _decorator: DecoratorType): any {}
  onInitialize(_artifact: ArtifactType, _decorator: DecoratorType): any {}
}

export default GatewayMiddleware;
