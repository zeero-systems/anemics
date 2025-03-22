import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import type { InterceptorInterface } from '~/controller/interfaces.ts';
import type { ContextType } from '~/bootstraper/types.ts';

import Bootstraper from '~/bootstraper/services/bootstraper.service.ts';
import Module from '~/module/annotations/module.annotation.ts';
import RouterInterceptor from '~/controller/interceptors/router.interceptor.ts';
import Controller from '~/controller/annotations/controller.annotation.ts';
import Intercept from '~/controller/annotations/intercept.annotation.ts';
import Get from '~/controller/annotations/get.annotation.ts';
import { EndpointType } from '~/controller/types.ts';
import { ModuleInterface } from '~/module/interfaces.ts';

describe('bootstraper', () => {
  
  @Intercept('then', 1)
  class ResponseInterceptor implements InterceptorInterface {
    async onUse<T>(context: ContextType<T & EndpointType>): Promise<void> {
      
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
            return 
          }
  
          if (orContentTypes.includes('text/html')) {
            const encoder = new TextEncoder();
            context.responser.setBody(encoder.encode(context.responser.raw));
            context.responser.setHeader('Content-Type', 'text/html');
            return 
          }
  
          context.responser.setBody(String(context.responser.raw));
          context.responser.setHeader('Content-Type', 'text/plain');
          return 
        }    
    
        return
      }

      context.responser.setBody(null);
      context.responser.setStatus(404);
    }
  }

  @Intercept('catch')
  class ExceptionInterceptor implements InterceptorInterface {
    async onUse<T>(context: ContextType<T>): Promise<void> {
      context.responser.setStatus(500)
      context.responser.setBody(context.responser.metadata.error.context)
    }
  }

  @Intercept('finally') 
  class LogInterceptor implements InterceptorInterface {
    async onUse<T>(context: ContextType<T>): Promise<void> {
      
    }

  }

  @Controller('any')
  class AnyController {
    @Get('health')
    public getStatus() { return 'OK' }

    @Get('user')
    public getUser() {
      throw new Error("Database gonne away"); 
    }
  }
  
  let updaterWasUpdated = false

  @Module({
    controllers: [AnyController],
    interceptors: [
      RouterInterceptor, 
      LogInterceptor, 
      ExceptionInterceptor,
      ResponseInterceptor
    ]
  })
  class AppModule implements ModuleInterface {
    constructor() {}

    async onUpdate(): Promise<void> {
      updaterWasUpdated = true      
    }
  }
  
  const app = Bootstraper.create(AppModule);
  
  it('expect status 200', async () => {
    const response = await app.handler(new Request('http://localhost:3000/any/health'))

    expect(response.status).toEqual(200)
  });

  it('expect status 500', async () => {
    const response = await app.handler(new Request('http://localhost:3001/any/user'))

    expect(response.status).toEqual(500)
  });

  it('expect status 200', async () => {
    await app.update()

    expect(updaterWasUpdated).toEqual(true)
  });

});
