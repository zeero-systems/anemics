import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import type { AnnotationInterface, ArtifactType, ContainerInterface, DecoratorType, PackInterface } from '@zeero/commons';
import type { MiddlewareInterface } from '~/controller/interfaces.ts';
import type { ContextType, EventType, NextFunctionType } from '~/controller/types.ts';

import { ConsoleTransport, Decorator, Entity, Factory, Pack, Tracer } from '@zeero/commons';
import Application from '~/entrypoint/services/application.service.ts';
import Anemic from '~/entrypoint/services/anemic.service.ts';
import Controller from '~/controller/decorations/controller.decoration.ts';
import Get from '~/controller/decorations/get.decoration.ts';
import Post from '~/controller/decorations/post.decoration.ts';
import GatewayMiddleware from '~/controller/middlewares/gateway.middleware.ts';

describe('entrypoint', () => {
  class ExceptionMiddleware implements MiddlewareInterface, AnnotationInterface {
    name: string = 'Exception';
    events: Array<EventType> = ['exception']

    onUse(context: ContextType, next: NextFunctionType): Promise<void> {
      if (context.handler.error) {
        context.responser.body = 'Internal Server Error'
      }

      return next();
    }

    onAttach(_artifact: ArtifactType, _decorator: DecoratorType): any { }
    onInitialize(_artifact: ArtifactType, _decorator: DecoratorType) { }
  }

  class RequestMiddleware implements MiddlewareInterface, AnnotationInterface {
    name: string = 'Request';
    events: Array<EventType> = ['before']

    async onUse(context: ContextType, next: NextFunctionType): Promise<void> {
      const hasContent = context.requester.headers?.get('Content-Length');
      const hasContentType = context.requester.headers?.get('Content-Type');
      
      if (!hasContentType || hasContentType == 'application/json') {
        if (hasContent && Number(hasContent) > 0 && !context.requester.bodyUsed) {
          context.requester.parsed = await context.requester.json();
        }
        
      }
      
      if (context.route.action.entity) {
        const properties = context.requester.parsed ?? {};
        context.requester.parsed = Factory.construct(context.route.action.entity, { properties }) as any;
      }

      return next();
    }

    onAttach(_artifact: ArtifactType, _decorator: DecoratorType): any { }
    onInitialize(_artifact: ArtifactType, _decorator: DecoratorType) { }
  }

  class ResponseMiddleware implements MiddlewareInterface, AnnotationInterface {
    readonly name: string = 'Response'
    events: Array<EventType> = ['after']

    onUse(context: ContextType, next: NextFunctionType): Promise<void> {
      if (context.responser && context.responser.body) {
        if (typeof context.responser.body !== 'string') {
          context.responser.parsed = JSON.stringify(context.responser.body);
        }
      }

      return next();
    }

    onAttach(_artifact: ArtifactType, _decorator: DecoratorType): any { }
    onInitialize(_artifact: ArtifactType, _decorator: DecoratorType) { }
  }

  const ResponseParser = Decorator.create(ResponseMiddleware);

  class Test extends Entity {
    name!: string;
  }

  @ResponseParser()
  @Controller('/test')
  class ControllerTest {
    @Get()
    getTest(context: ContextType) {
      context.responser.setHeader('Content-Type', 'application/json');
      context.responser.setBody('reached ???');

      return 'reached getTest';
    }

    @Get('/error')
    getTestToThrow(_context: ContextType) {
      throw new Error('A throw test')
    }

    @Post('/create', Test)
    postTest(context: ContextType<Test>) {
      return context.requester.parsed;
    }
  }

  @Controller()
  class ControllerMiddlewareTest {
    @Get('/test')
    @ResponseParser()
    getTest(context: ContextType) {
      context.responser.setHeader('Content-Type', 'application/json');
      return 'reached getTestMiddleware';
    }
  }

  @Controller('/health')
  class HealthController {
    @Get('/status')
    public getStatus(context: ContextType) {
      context.responser.setHeader('Content-Type', 'application/json');
      context.responser.setBody(JSON.stringify({ status: 'OK', server: context.server.hostname }));
    }
  }
  
  const mockTracer = {
    name: 'Tracer',
    target: new Tracer({
      name: 'AnemicTest',
      transports: [new ConsoleTransport({ pretty: true, span: false, log: false })],
    }),
  }

  describe('simple server', () => {
    let bootText = '';

    @Pack()
    class Sub implements PackInterface {
      constructor(container: ContainerInterface) { }

      onBoot(): void {}
    }

    @Pack({
      providers: [mockTracer],
      consumers: [HealthController],
      packs: [Sub]
    })
    class App implements PackInterface {
      constructor(container: ContainerInterface) {  }

      onBoot(): void {
        bootText = 'onBoot reached';
      }
    }

    const anemic = new Anemic(new Application(App, { http: { name: 'Joey', port: 3000 }, middlewares: [GatewayMiddleware, ResponseMiddleware]  }));

    it('boot', async () => {
      await anemic.boot();

      expect(bootText).toEqual('onBoot reached');
    });

    it('fetch', async () => {
      await anemic.start();
      const response = await fetch('http://0.0.0.0:3000/health/status', { method: 'get' });
      const responseText = await response.text();
      await anemic.stop();

      expect(responseText).toEqual('{"status":"OK"}');
    });

    it('start stop again', async () => {
      await anemic.start();
      await anemic.stop();
    });
  });

  describe('server with controller middlewares', () => {
    @Pack({
      providers: [mockTracer],
      consumers: [ControllerMiddlewareTest],
    })
    class App implements PackInterface {}

    const anemic2 = new Anemic(new Application(App, { http: { name: 'Chandler', port: 3001 }, middlewares: [GatewayMiddleware, ResponseMiddleware] }));

    it('fetch', async () => {
      await anemic2.start();
      const response = await fetch('http://0.0.0.0:3001/test', { method: 'get' });
      const responseText = await response.text();
      await anemic2.stop();

      expect(responseText).toEqual('reached getTestMiddleware');
    });
  });

  it('server with global middlewares', async () => {
    @Pack({
      providers: [mockTracer],
      consumers: [ControllerTest],
    })
    class App implements PackInterface {}

    const anemic = new Anemic(
      new Application(App, {
        http: { name: 'Ross', port: 3002 },
        middlewares: [
          RequestMiddleware, 
          GatewayMiddleware,
          ExceptionMiddleware
        ],
      }),
    );

    await anemic.start();

    const response1 = await fetch('http://0.0.0.0:3002/test', { method: 'get' });
    const response1Text = await response1.text();

    expect(response1Text).toEqual('reached getTest');

    const response2 = await fetch('http://0.0.0.0:3002/test/create', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Eduardo' }),
    });
    const responseText2 = await response2.json();

    expect(responseText2.name).toEqual('Eduardo');

    const response3 = await fetch('http://0.0.0.0:3002/test/error', { method: 'get' })
    const error = await response3.text()

    expect(error).toBe('Internal Server Error')
    
    await anemic.stop();
  });
});
