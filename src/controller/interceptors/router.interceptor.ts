import type { InterceptorInterface } from '~/controller/interfaces.ts';
import type { ContextType, NextType } from '~/application/types.ts';
import type { EndpointType } from '~/controller/types.ts';

import Middleware from '~/controller/annotations/middleware.annotation.ts';

@Middleware()
export class RouterInterceptor implements InterceptorInterface {
  async onUse<T>(context: ContextType<T & EndpointType>, next: NextType): Promise<void> {
    if (context.extra) {
      const rawBody = await new context.extra.controller.target()[context.extra.handler.propertyKey](
        ...(context.responser.metadata.parameters || []),
      );

      if (rawBody) {
        context.responser.setRaw(rawBody);
      }
    }

    return next();
  }
}

export default RouterInterceptor;
