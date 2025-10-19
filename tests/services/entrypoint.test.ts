import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import type { AnnotationInterface, ArtifactType, DecoratorType, PackInterface } from '@zeero/commons';
import type { MiddlewareInterface } from '~/controller/interfaces.ts';
import type { ContextType, EventType, NextFunctionType } from '~/controller/types.ts';
import type { ApplicationInterface } from '~/entrypoint/interfaces.ts';
import type { RequesterInterface, ResponserInterface } from '~/network/interfaces.ts';
import type { ServerOptionsType } from '~/network/types.ts';

import { Decorator, Entity, Factory, Pack } from '@zeero/commons';
import Application from '~/entrypoint/services/application.service.ts';
import Anemic from '~/entrypoint/services/anemic.service.ts';
import Controller from '~/controller/decorations/controller.decoration.ts';
import Get from '~/controller/decorations/get.decoration.ts';
import Post from '~/controller/decorations/post.decoration.ts';

describe('entrypoint', () => {
  class Request implements MiddlewareInterface {
    name: string = 'Request';
    events: Array<EventType> = ['before'];
    async onUse(context: ContextType, next: NextFunctionType): Promise<void> {
      if (context.requester) {
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
      }
      
      await next();
    }
  }

  class Response implements MiddlewareInterface {
    name: string = 'Response';
    events: Array<EventType> = ['after'];
    async onUse(context: ContextType, next: NextFunctionType): Promise<void> {
      if (context.responser && typeof context.responser.body !== 'string') {
        context.responser.parsed = JSON.stringify(context.responser.body);
      }

      await next();
    }
  }

  const ResponseParser = Decorator.create(Response);

  class Test extends Entity {
    name!: string;
  }

  @Controller('/test')
  class ControllerTest {
    @Get()
    getTest(responser: ResponserInterface) {
      responser.setHeader('Content-Type', 'application/json');
      responser.setBody('reached getTest');

      return 'reached getTestMiddleware';
    }

    @Post('/create', Test)
    postTest(requester: RequesterInterface<Test>) {
      return requester.parsed;
    }
  }

  @ResponseParser()
  @Controller()
  class ControllerMiddlewareTest {
    @Get('/test')
    getTest(responser: ResponserInterface) {
      responser.setHeader('Content-Type', 'application/json');
      return 'reached getTestMiddleware';
    }
  }

  @Controller('/health')
  class HealthController {
    @Get('/status')
    public getStatus(responser: ResponserInterface, server: ServerOptionsType) {
      responser.setHeader('Content-Type', 'application/json');
      responser.setBody(JSON.stringify({ status: 'OK', server: server.hostname }));
    }
  }

  describe('simple server', () => {
    let bootText = '';

    @Pack({
      providers: [],
      consumers: [ControllerTest, HealthController],
    })
    class App implements PackInterface {
      onBoot(application: ApplicationInterface): void {
        bootText = 'onBoot reached';
      }
    }

    const anemic = new Anemic(new Application(App, { http: { port: 3000 } }));

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

    it('stop start again', async () => {
      await anemic.start();
      await anemic.stop();
    });
  });

  describe('server with controller middlewares', () => {
    @Pack({
      providers: [],
      consumers: [ControllerMiddlewareTest],
    })
    class App implements PackInterface {}

    const anemic = new Anemic(new Application(App, { http: { port: 3001 } }));

    it('fetch', async () => {
      await anemic.start();
      const response = await fetch('http://0.0.0.0:3001/test', { method: 'get' });
      const responseText = await response.text();

      expect(responseText).toEqual('reached getTestMiddleware');
      await anemic.stop();
    });
  });

  describe('server with global middlewares', () => {
    @Pack({
      providers: [],
      consumers: [Request, Response, ControllerTest],
    })
    class App implements PackInterface {}

    const anemic = new Anemic(
      new Application(App, {
        http: { port: 3002 },
        middlewares: [
          'Request',
          'Response',
        ],
      }),
    );

    it('fetch', async () => {
      await anemic.start();
      const response = await fetch('http://0.0.0.0:3002/test', { method: 'get' });
      const responseText = await response.text();

      expect(responseText).toEqual('reached getTestMiddleware');

      const response2 = await fetch('http://0.0.0.0:3002/test/create', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Eduardo' }),
      });
      const responseText2 = await response2.json();

      expect(responseText2.name).toEqual('Eduardo');
 
      await anemic.stop();
    });
  });
});
