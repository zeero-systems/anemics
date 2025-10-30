import type { PackInterface, SpanInterface } from '@zeero/commons';
import type { ServerOptionsType } from '~/network/types.ts';
import type { AnemicInterface, ApplicationInterface } from '~/entrypoint/interfaces.ts';
import type { RequesterInterface, ResponserInterface } from '~/network/interfaces.ts';
import type { ContextType, RouteType } from '~/controller/types.ts';
import type { HandlerType } from '~/entrypoint/types.ts';

import { Dispatcher, SpanEnum, StatusEnum } from '@zeero/commons';

import Responser from '~/network/services/responser.service.ts';
import Requester from '~/network/services/requester.service.ts';
import MethodEnum from '~/network/enums/method.enum.ts';
import EventEnum from '~/controller/enums/event.enum.ts';

export class Anemic implements AnemicInterface {
  private dispatcher = new Dispatcher<{ boot: []; start: []; stop: [] }>();

  constructor(public application: ApplicationInterface) {
    const span = this.application.tracer.start({ name: 'anemic', kind: SpanEnum.INTERNAL });

    for (const packName of application.packer.packs) {
      const pack = application.packer.container.construct<PackInterface>(packName);

      const onBootMethod = pack?.onBoot;
      if (onBootMethod && typeof onBootMethod === 'function') {
        this.dispatcher.subscribe('boot', async (...args: any[]) => {
          using bootSpan = span.child({ name: `${String(packName)} boot`, kind: SpanEnum.INTERNAL });
          try {
            await onBootMethod(...args);
            bootSpan.status({ type: StatusEnum.RESOLVED });
          } catch (error: any) {
            bootSpan.error(String(error?.message || error));
            bootSpan.status({ type: StatusEnum.REJECTED });
            bootSpan.attributes({
              error: { name: error.name, message: String(error?.message || error), cause: error.cause },
            });
            throw error;
          }
        });
      }

      const onStartMethod = pack?.onStart;
      if (onStartMethod && typeof onStartMethod === 'function') {
        this.dispatcher.subscribe('start', async (...args: any[]) => {
          using startSpan = span.child({ name: `${String(packName)} start`, kind: SpanEnum.INTERNAL });
          try {
            await onStartMethod(...args);
            startSpan.status({ type: StatusEnum.RESOLVED });
          } catch (error: any) {
            startSpan.error(String(error?.message || error));
            startSpan.status({ type: StatusEnum.REJECTED });
            startSpan.attributes({
              error: { name: error.name, message: String(error?.message || error), cause: error.cause },
            });
            throw error;
          }
        });
      }

      const onStopMethod = pack?.onStop;
      if (onStopMethod && typeof onStopMethod === 'function') {
        this.dispatcher.subscribe('stop', async (...args: any[]) => {
          using stopSpan = span.child({ name: `${String(packName)} stop`, kind: SpanEnum.INTERNAL });
          try {
            await onStopMethod(...args);
            stopSpan.status({ type: StatusEnum.RESOLVED });
          } catch (error: any) {
            stopSpan.error(String(error?.message || error));
            stopSpan.status({ type: StatusEnum.REJECTED });
            stopSpan.attributes({
              error: { name: error.name, message: String(error?.message || error), cause: error.cause },
            });
            throw error;
          }
        });
      }
    }

    for (const server of this.application.servers) {
      this.dispatcher.subscribe('start', async () => {
        const span = this.application.tracer.start({ name: 'anemic', kind: SpanEnum.SERVER });
        await server.start(async (request, socket) => {
          const resources = {
            system: {
              ...this.application.resourcer.getSystem(true),
              execPath: undefined,
              entrypoint: undefined,
            },
            memory: this.application.resourcer.getMemory(true),
          };
          const child = span.child({ name: `HANDLER ${resources.system?.pid}`, kind: SpanEnum.INTERNAL });
          child.attributes(resources);

          let handler;
          if (server.accepts.includes(MethodEnum.SOCKET)) {
            handler = this.socketHandler(new Requester(request), new Responser(), server.options, span, socket);
          } else {
            handler = this.httpHandler(new Requester(request), new Responser(), server.options, span, socket);
          }

          try {
            using childSpan = child;
            const response = await handler;
            childSpan.status({ type: StatusEnum.RESOLVED });
            return response;
          } catch (error: any) {
            child.error(error);
            child.event({
              name: 'handler.error',
              attributes: {
                error: { name: error.name, message: String(error?.message || error), stack: error.stack },
              },
            });
            child.status({ type: StatusEnum.REJECTED });
            child.end();
            throw error;
          }
        });

        this.dispatcher.subscribe('stop', async () => {
          await server.stop();
          span.status({ type: StatusEnum.RESOLVED });
          span.end();
        });
      });
    }
  }

  public async httpHandler(
    requester: RequesterInterface,
    responser: ResponserInterface,
    server: ServerOptionsType,
    span: SpanInterface,
    _socket?: WebSocket,
  ): Promise<Response> {
    const readySpan = span.child({ name: `request`, kind: SpanEnum.INTERNAL });
    const method = requester.method.toLowerCase() as any;
    const route = this.application.router.routes[method]?.find((route) => route.pattern?.test(requester.url));

    if (!route) {
      readySpan.event({ name: 'route.not.found' });
      readySpan.status({ type: StatusEnum.REJECTED });
      readySpan.end();

      return new Response(null, { status: 404 });
    }

    readySpan.attributes({ method: requester.method, pathname: route.pathname });
    readySpan.info(`${requester.method} ${route.pathname}`);

    const container = this.application.packer.container.duplicate();

    readySpan.attributes({ route: { action: route.action, controller: route.controller } });
    readySpan.status({ type: StatusEnum.RESOLVED });
    readySpan.end();

    const responseSpan = span.child({ name: `response`, kind: SpanEnum.INTERNAL });

    const handler: HandlerType = { event: EventEnum.BEFORE, attempts: 1, error: undefined };
    const context: ContextType = { handler, requester, responser, container, route, server, span: responseSpan };
    container.collection.set('Context', { artifact: { name: 'Context', target: context }, tags: ['P'] });

    await this.execute(route, context);

    const status = responser.status || 200;

    responseSpan.info(`${requester.method} ${route.pathname} with ${status}`);
    responseSpan.event({
      name: 'handled',
      attributes: { status, statusText: responser.statusText, headers: responser.headers },
    });
    responseSpan.status({ type: StatusEnum.RESOLVED });
    responseSpan.end();

    return new Response(responser.parsed || responser.body, {
      status: status,
      statusText: responser.statusText,
      headers: responser.headers,
    });
  }

  private async execute(route: RouteType, context: ContextType): Promise<void> {
    const attempts = context.handler.attempts;

    await route.wired.try(context).catch((error) => {
      context.handler.error = error;
      return route.wired.catch(context);
    });

    if (context.handler.attempts !== attempts) {
      return this.execute(route, context);
    }
  }

  public socketHandler(
    _request: RequesterInterface,
    _response: ResponserInterface,
    _server: ServerOptionsType,
    _span: SpanInterface,
    _socket: WebSocket,
  ): Promise<Response> {
    throw new Error('Not implemented');
  }

  public boot(): Promise<void> {
    return this.dispatcher.dispatch('boot');
  }

  public start(): Promise<void> {
    return this.dispatcher.dispatch('start');
  }

  public stop(): Promise<void> {
    return this.dispatcher.dispatch('stop');
  }
}

export default Anemic;
