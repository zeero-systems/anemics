import type { PackInterface, TracerInterface } from '@zeero/commons';
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
  private dispatcher = new Dispatcher<{ boot: any[]; start: any[]; stop: any[] }>();

  constructor(public application: ApplicationInterface) {
    const tracer = this.application.tracer.start({ name: 'anemic', kind: SpanEnum.INTERNAL });

    for (const packName of application.packer.packs) {
      const pack = application.packer.container.construct<PackInterface>(packName);

      const onBootMethod = pack?.onBoot;
      if (onBootMethod && typeof onBootMethod === 'function') {
        this.dispatcher.subscribe('boot', async (...args: any[]) => {
          const bootSpan = tracer.start({ name: `${String(packName)} boot`, kind: SpanEnum.INTERNAL });
          try {
            await onBootMethod(...args);
            bootSpan.status(StatusEnum.RESOLVED);
          } catch (error: any) {
            bootSpan.error(String(error?.message || error));
            bootSpan.status(StatusEnum.REJECTED);
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
          const startSpan = tracer.start({ name: `${String(packName)} start`, kind: SpanEnum.INTERNAL });
          try {
            await onStartMethod(...args);
            startSpan.status(StatusEnum.RESOLVED);
          } catch (error: any) {
            startSpan.error(String(error?.message || error));
            startSpan.status(StatusEnum.REJECTED);
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
          const stopSpan = tracer.start({ name: `${String(packName)} stop`, kind: SpanEnum.INTERNAL });
          try {
            await onStopMethod(...args);
            stopSpan.status(StatusEnum.RESOLVED);
          } catch (error: any) {
            stopSpan.error(String(error?.message || error));
            stopSpan.status(StatusEnum.REJECTED);
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
        const tracer = this.application.tracer.start({ name: 'anemic', kind: SpanEnum.SERVER });
        await server.start(async (request, socket) => {
          const resources = {
            system: {
              ...this.application.resourcer.getSystem(true),
              execPath: undefined,
              entrypoint: undefined,
            },
            memory: this.application.resourcer.getMemory(true),
          };
          
          const handlerTracer = tracer.start({ name: `HANDLER ${resources.system?.pid}`, kind: SpanEnum.INTERNAL });
          handlerTracer.attributes(resources);

          try {
            let response
            if (server.accepts.includes(MethodEnum.SOCKET)) {
              response = await this.socketHandler(new Requester(request), new Responser(), server.options, handlerTracer, socket);
            } else {
              response = await this.httpHandler(new Requester(request), new Responser(), server.options, handlerTracer, socket);
            }            

            handlerTracer.status(StatusEnum.RESOLVED);
            return response;
          } catch (error: any) {
            handlerTracer.error(error);
            handlerTracer.attributes({
              error: { name: error.name, message: String(error?.message || error), stack: error.stack }
            });
            handlerTracer.status(StatusEnum.REJECTED);
          }

          handlerTracer.flush();
        });

        this.dispatcher.subscribe('stop', async () => {
          await server.stop();
          tracer.status(StatusEnum.RESOLVED);
          tracer.end();
          tracer.flush();
        });
      });
    }
  }

  public async httpHandler(
    requester: RequesterInterface,
    responser: ResponserInterface,
    server: ServerOptionsType,
    tracer: TracerInterface,
    _socket?: WebSocket,
  ): Promise<Response> {
    const readySpan = tracer.start({ name: `request`, kind: SpanEnum.INTERNAL });
    const method = requester.method.toLowerCase() as any;
    const route = this.application.router.routes[method]?.find((route) => route.pattern?.test(requester.url));

    if (!route) {
      readySpan.event('route.not_found');
      readySpan.status(StatusEnum.REJECTED);
      readySpan.end();

      return new Response(null, { status: 404 });
    }

    readySpan.event('route.found');
    readySpan.info(`${requester.method} ${route.pathname}`);

    const container = this.application.packer.container.duplicate();

    readySpan.status(StatusEnum.RESOLVED);
    readySpan.attributes({ method: requester.method, pathname: route.pathname, action: route.action, controller: route.controller });
    readySpan.end();

    const responseTracer = tracer.start({ name: `response`, kind: SpanEnum.INTERNAL });

    const handler: HandlerType = { event: EventEnum.BEFORE, attempts: 1, error: undefined };
    const context: ContextType = { handler, requester, responser, container, route, server, tracer: responseTracer };
    container.collection.set('Context', { artifact: { name: 'Context', target: context }, tags: ['P'] });

    responseTracer.event('context.created');

    await this.execute(route, context);

    const status = responser.status || 200;

    responseTracer.event('response.executed');
    responseTracer.attributes({ status, statusText: responser.statusText, headers: responser.headers });
    responseTracer.status(StatusEnum.RESOLVED);
    responseTracer.end();

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
    _tracer: TracerInterface,
    _socket: WebSocket,
  ): Promise<Response> {
    throw new Error('Not implemented');
  }

  public boot(...args: any[]): Promise<void> {
    return this.dispatcher.dispatch('boot', ...args);
  }

  public start(...args: any[]): Promise<void> {
    return this.dispatcher.dispatch('start', ...args);
  }

  public stop(...args: any[]): Promise<void> {
    return this.dispatcher.dispatch('stop', ...args);
  }
}

export default Anemic;
