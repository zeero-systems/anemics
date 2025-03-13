import type { ContextType, NextType } from '~/server/types.ts';
import type { MiddlewareInterface } from '~/interceptor/interfaces.ts';
import type { EndpointType } from '~/controller/types.ts';

export class Encoder implements MiddlewareInterface {
  static weigth: number = 0;
  async onRequest(endpoint: EndpointType | undefined, context: ContextType, next: NextType): Promise<void> {
    if (endpoint) {

      if (!context.responser.status) {
        context.responser.setStatus(endpoint?.handler.method == 'POST' ? 201 : 200);
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

export default Encoder;
