import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import type { MiddlewareInterface } from '~/controller/interfaces.ts'
import type { ContextType, MiddlewareEventType, NextFunctionType } from '~/controller/types.ts';


import Application from '~/entrypoint/services/application.service.ts';
import Anemic from '~/entrypoint/services/anemic.service.ts';
import Controller from '~/controller/decorations/controller.decoration.ts';
import Get from '~/controller/decorations/get.decoration.ts';
import { ApplicationInterface } from '~/entrypoint/interfaces.ts';
import { ResponseInterface } from '~/network/interfaces.ts';
import { AnnotationInterface, Pack, PackInterface, ArtifactType, DecoratorType, Decorator } from '@zeero/commons';
import { ServerOptionsType } from '~/network/types.ts';

describe('entrypoint', () => {
  
  // @Intercept('then', 1)
  // class ResponseInterceptor implements InterceptorInterface {
  //   async onUse<T>(context: ContextType<T & EndpointType>): Promise<void> {
      
  //     if (context.extra) {
  
  //       if (!context.responser.status) {
  //         context.responser.setStatus(context.extra?.handler.method == 'POST' ? 201 : 200);
  //       }
  
  //       if (context.responser.raw) {
  //         const requesterContentType = context.requester.headers?.get('Content-Type');
  //         const responserContentType = context.responser.headers?.get('Content-Type');
          
  //         const orContentTypes = [requesterContentType, responserContentType]
  
  //         if (orContentTypes.includes('application/json')) {
  //           context.responser.setBody(JSON.stringify(context.responser.raw));
  //           context.responser.setHeader('Content-Type', 'application/json');
  //           return 
  //         }
  
  //         if (orContentTypes.includes('text/html')) {
  //           const encoder = new TextEncoder();
  //           context.responser.setBody(encoder.encode(context.responser.raw));
  //           context.responser.setHeader('Content-Type', 'text/html');
  //           return 
  //         }
  
  //         context.responser.setBody(String(context.responser.raw));
  //         context.responser.setHeader('Content-Type', 'text/plain');
  //         return 
  //       }    
    
  //       return
  //     }

  //     context.responser.setBody(null);
  //     context.responser.setStatus(404);
  //   }
  // }

  // @Intercept('catch')
  // class ExceptionInterceptor implements InterceptorInterface {
  //   async onUse<T>(context: ContextType<T>): Promise<void> {
  //     context.responser.setStatus(500)
  //     context.responser.setBody(context.responser.metadata.error.context)
  //   }
  // }

  // @Intercept('finally') 
  // class LogInterceptor implements InterceptorInterface {
  //   async onUse<T>(context: ContextType<T>): Promise<void> {
      
  //   }

  // }

  // @Controller('any')
  // class AnyController {
  //   @Get('health')
  //   public getStatus() { return 'OK' }

  //   @Get('user')
  //   public getUser() {
  //     throw new Error("Database gonne away"); 
  //   }
  // }
  
  // let updaterWasUpdated = false

  // @Module({
  //   controllers: [AnyController],
  //   interceptors: [
  //     RouterInterceptor, 
  //     LogInterceptor, 
  //     ExceptionInterceptor,
  //     ResponseInterceptor
  //   ]
  // })
  // class AppModule implements ModuleInterface {
  //   constructor() {}

  //   async onUpdate(): Promise<void> {
  //     updaterWasUpdated = true      
  //   }
  // }
  
  // const app = Bootstraper.create(AppModule);
  
  // it('expect status 200', async () => {
  //   const response = await app.handler(new Request('http://localhost:3000/any/health'))

  //   expect(response.status).toEqual(200)
  // });

  // it('expect status 500', async () => {
  //   const response = await app.handler(new Request('http://localhost:3001/any/user'))

  //   expect(response.status).toEqual(500)
  // });

  // it('expect status 200', async () => {
  //   await app.update()

  //   expect(updaterWasUpdated).toEqual(true)
  // });

  
  class ResponseParserAnnotation implements MiddlewareInterface, AnnotationInterface {
    name: string = 'Response'
    event: MiddlewareEventType = 'after'
    async onUse(context: ContextType, next: NextFunctionType): Promise<void> {
      if (context.result && context.response) {
        context.response.body = context.result
      }

      await next()
    }
    onAttach(artifact: ArtifactType, decorator: DecoratorType) { }
    onInitialize(artifact: ArtifactType, decorator: DecoratorType) { }
  }

  const ResponseParser = Decorator.create(ResponseParserAnnotation)

  @Controller('/test')
  class ControllerTest {
    @Get()
    getTest(response: ResponseInterface) {
      response.setHeader('Content-Type', 'application/json')
      response.setBody('reached getTest')
    }
  }

  @ResponseParser()
  @Controller()
  class ControllerMiddlewareTest {
    @Get('/test')
    getTest(response: ResponseInterface) {
      response.setHeader('Content-Type', 'application/json')
      return 'reached getTestMiddleware'
    }
  }

  @Controller('/health')
  class HealthController {
    @Get('/status')
    public getStatus(response: ResponseInterface, server: ServerOptionsType) {
      response.setHeader('Content-Type', 'application/json')
      response.setBody(JSON.stringify({ status: 'OK', server: server.hostname }))
    }
  }

  describe('simple server', () => {
    let bootText = ''
    
    @Pack({ 
      providers: [], 
      consumers: [ControllerTest, HealthController]
    })
    class App implements PackInterface {
      onBoot(application: ApplicationInterface): void {
        bootText = 'onBoot reached'
      }
    }

    const anemic = new Anemic(new Application(App, { http: { port: 3000 } }))
    
    it('boot', async () => {
      await anemic.boot()

      expect(bootText).toEqual('onBoot reached');      
    })

    it('fetch', async () => {
      await anemic.start()
      const response = await fetch('http://0.0.0.0:3000/health/status', { method: 'get' });
      const responseText = await response.text();
      await anemic.stop()
  
      expect(responseText).toEqual('{"status":"OK"}');
    })

    it('stop start again', async () => {
      await anemic.start()
      await anemic.stop()
    })
  })

  describe('server with middlewares', () => {
    
    @Pack({ 
      providers: [], 
      consumers: [ControllerMiddlewareTest]
    })
    class App implements PackInterface {}

    const anemic = new Anemic(new Application(App, { http: { port: 3001 } }))
      
    it('fetch', async () => {
      await anemic.start()
      const response = await fetch('http://0.0.0.0:3001/test', { method: 'get' });
      const responseText = await response.text();
      
      expect(responseText).toEqual('reached getTestMiddleware');
      await anemic.stop()
    })
  })

});
