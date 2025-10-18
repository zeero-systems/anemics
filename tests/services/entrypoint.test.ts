import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import type { MiddlewareInterface } from '~/controller/interfaces.ts'
import type { ContextType, EventType, NextFunctionType } from '~/controller/types.ts';


import Application from '~/entrypoint/services/application.service.ts';
import Anemic from '~/entrypoint/services/anemic.service.ts';
import Controller from '~/controller/decorations/controller.decoration.ts';
import Get from '~/controller/decorations/get.decoration.ts';
import { ApplicationInterface } from '~/entrypoint/interfaces.ts';
import { ResponseInterface } from '~/network/interfaces.ts';
import { AnnotationInterface, Pack, PackInterface, ArtifactType, DecoratorType, Decorator } from '@zeero/commons';
import { ServerOptionsType } from '~/network/types.ts';

describe('entrypoint', () => {

  class ResponseParserAnnotation implements MiddlewareInterface, AnnotationInterface {
    name: string = 'Response'
    event: EventType = 'after'
    async onUse(context: ContextType, next: NextFunctionType): Promise<void> {
      if (context.current.result && context.response) {
        context.response.body = context.current.result
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

      return 'reached getTestMiddleware'
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

  describe('server with controller middlewares', () => {
    
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

  describe('server with global middlewares', () => {
    
    @Pack({ 
      providers: [], 
      consumers: [ControllerTest]
    })
    class App implements PackInterface {}

    const anemic = new Anemic(new Application(App, { http: { port: 3002 }, middlewares: [
      new ResponseParserAnnotation()
    ] }))
      
    it('fetch', async () => {
      await anemic.start()
      const response = await fetch('http://0.0.0.0:3002/test', { method: 'get' });
      const responseText = await response.text();
      
      expect(responseText).toEqual('reached getTestMiddleware');
      await anemic.stop()
    })
  })

});
