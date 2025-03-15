import type { ContextType, NextType } from '~/application/types.ts';
import type { InterceptorInterface } from '~/controller/interfaces.ts';
import type { EndpointType } from '~/controller/types.ts';

import Middleware from '~/controller/annotations/middleware.annotation.ts';

@Middleware('after', 'ordered')
export class EncoderInterceptor implements InterceptorInterface {
   onUse<T>(context: ContextType<T & EndpointType>, next: NextType): Promise<void> {
    if (context.extra) {

      if (!context.responser.status) {
        context.responser.setStatus(context.extra?.handler.method == 'POST' ? 201 : 200);
      }

      if (context.responser.raw) {
        const requesterContentType = context.requester.headers?.get('Content-Type');
        const responserContentType = context.responser.headers?.get('Content-Type');
        
        const orContentTypes = [requesterContentType, responserContentType]

        if (orContentTypes.includes('application/json')) {
          context.responser.setBody(JSON.stringify(context.responser.raw));
          context.responser.setHeader('Content-Type', 'application/json');
          return next();
        }

        if (orContentTypes.includes('text/html')) {
          const encoder = new TextEncoder();
          context.responser.setBody(encoder.encode(context.responser.raw));
          context.responser.setHeader('Content-Type', 'text/html');
          return next();
        }

        context.responser.setBody(String(context.responser.raw));
        context.responser.setHeader('Content-Type', 'text/plain');
        return next();
      }    
  
      if (context.responser.body) {
        return next();
      }
    }
    
    context.responser.setBody(null);
    context.responser.setStatus(404);
    
    return next();
  }
}

export default EncoderInterceptor;
