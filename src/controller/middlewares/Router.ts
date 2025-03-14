import type { MiddlewareInterface } from '~/controller/interfaces.ts';
import type { ContextType, NextType } from '~/server/types.ts';
import type { EndpointType } from '~/controller/types.ts';

export class Router implements MiddlewareInterface {
  static weigth: number = 0;
  async onRequest(endpoint: EndpointType | undefined, context: ContextType, next: NextType): Promise<void> {
    if (endpoint) {
      const rawBody = await new endpoint.controller.target()[endpoint.handler.propertyKey](
        ...(context.metadata.parameters || []),
      );

      if (rawBody) {
        context.responser.setRaw(rawBody);
      }
    }

    return next();
  }
}

export default Router;
