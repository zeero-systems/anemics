import type { ContextType } from '~/bootstraper/types.ts';
import type { EndpointType } from '~/controller/types.ts';

import Interceptor from '~/controller/services/interceptor.service.ts';
import Responser from '~/bootstraper/services/responser.service.ts';
import Gateway from '~/controller/services/gateway.service.ts';
import Requester from '~/bootstraper/services/requester.service.ts';

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

    const endpoints = Gateway.endpoints.get(context.requester.method)

    if (endpoints) {
      for (let index = 0; index < endpoints.length; index++) {
        if (endpoints[index].handler.pattern.test(context.requester.url)) {
          context.extra = endpoints[index]
          break;
        }        
      }
    }
      
    try {
      for (const interceptor of Interceptor['then']) {
        await interceptor.onUse(context)
      }
    } catch (error: any) {
      context.responser.addMetadata('error', error)
      
      for (const interceptor of Interceptor['catch']) {
        await interceptor.onUse(context)
      }
    }

    for (const interceptor of Interceptor['finally']) {
      interceptor.onUse(context)
    }

    return new Response(context.responser.body, {
      status: context.responser.status,
      statusText: context.responser.statusText,
      headers: context.responser.headers
    })
  }
}

export default Application