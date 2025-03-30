import type { InterceptorInterface } from '~/controller/interfaces.ts';
import type { ContextType } from '~/bootstraper/types.ts';
import type { EndpointType } from '~/controller/types.ts';

import Intercept from '~/controller/annotations/intercept.annotation.ts';

@Intercept('then', 1)
export class RouterInterceptor implements InterceptorInterface {
  async onUse<T>(context: ContextType<T & EndpointType>): Promise<void> {
    if (context.extra) {
      const controller = context.container.construct<any>(context.extra.controller.targetName)

      if (controller) {
        const rawBody = await controller[context.extra.handler.propertyKey](
          ...(context.responser.metadata.parameters || [context]),
        );

        if (rawBody) {
          context.responser.setRaw(rawBody);
        }
      }
    }
  }
}

export default RouterInterceptor;
