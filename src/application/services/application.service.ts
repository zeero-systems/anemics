import type { ContextType, NextType } from '~/application/types.ts';
import type { EndpointType, EventType } from '~/controller/types.ts';

import Interceptor from '~/controller/services/interceptor.service.ts';
import Responser from '~/application/services/responser.service.ts';
import Gateway from '~/controller/services/gateway.service.ts';
import Requester from '~/application/services/requester.service.ts';

import isMethod from '~/application/guards/is-method.guard.ts';

export class Application {

  constructor(public module: any) {} 

  async listen(options: any, handler: (request: Request) => Promise<Response>): Promise<any> {
    Interceptor.construct()
    return Deno.serve(options, handler);
  }

  async handler(request: Request): Promise<Response> {

    const context: ContextType<EndpointType> = { 
      requester: new Requester(request),
      responser: new Responser(),
      extra: undefined
    }
    
    if (isMethod(context.requester.method)) {
      const endpoints = Gateway.endpoints.get(context.requester.method);

      context.extra = endpoints?.find((route) => {
        return route.handler.pattern.test(context.requester.url);
      });

      const next = (event: EventType, index: number): NextType => async (): Promise<void> => {
        if (!Interceptor[event][index]) return;

        await Interceptor[event][index].onUse(context, next(event, index + 1))
      };
      
      try {
        await next('before', 0)();
        await next('middle', 0)();
        await next('after', 0)();
      } catch (error: any) {
        context.responser.addMetadata('error', error)
        
        await next('error', 0)();
      }

      await next('finally', 0)();
    }

    return new Response(context.responser.body, {
      status: context.responser.status,
      statusText: context.responser.statusText,
      headers: context.responser.headers
    })
  }
}

export default Application