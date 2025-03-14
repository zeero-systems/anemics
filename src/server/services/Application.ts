import type { ContextType, NextType } from '~/server/types.ts';

import Interceptor from '~/controller/services/Interceptor.ts';
import Responser from '~/server/services/Responser.ts';
import Gateway from '~/controller/services/Gateway.ts';
import Requester from '~/server/services/Requester.ts';

import isMethod from '~/server/guards/isMethod.ts';

export class Application {

  constructor(public module: any) {} 

  async listen(options: any, handler: (request: Request) => Promise<Response>): Promise<any> {
    return Deno.serve(options, handler);
  }

  async handler(request: Request): Promise<Response> {

    const context: ContextType = { 
      requester: new Requester(request),
      responser: new Responser(),
      metadata: {}
    }
    
    if (isMethod(context.requester.method)) {
      const routers = Gateway.endpoints.get(context.requester.method);

      const router = routers?.find((route) => {
        return route.handler.pattern.test(context.requester.url);
      });

      const next = (index: number): NextType => async (): Promise<void> => {
        if (!Interceptor.middlewares[index]) return;

        await new Interceptor.middlewares[index]().onRequest(router, context, next(index + 1))
      };

      await next(0)();
    }

    return new Response(context.responser.body, {
      status: context.responser.status,
      statusText: context.responser.statusText,
      headers: context.responser.headers
    })
  }
}

export default Application