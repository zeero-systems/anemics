import type { PackInterface } from '@zeero/commons';
import type { ServerOptionsType } from '~/network/types.ts';
import type { AnemicInterface, ApplicationInterface } from '~/entrypoint/interfaces.ts';
import type { MiddlewareInterface } from '~/controller/interfaces.ts';
import type { RequesterInterface, ResponserInterface } from '~/network/interfaces.ts';
import type { ContextType, MiddlerType, NextFunctionType, RouteType } from '~/controller/types.ts';
import type { HandlerType } from '~/entrypoint/types.ts';

import { Dispatcher } from '@zeero/commons';

import Responser from '~/network/services/responser.service.ts';
import Requester from '~/network/services/requester.service.ts';
import MethodEnum from '~/network/enums/method.enum.ts';
import EventEnum from '~/controller/enums/event.enum.ts';

export class Anemic implements AnemicInterface {
  private dispatcher = new Dispatcher<{ boot: []; start: []; stop: [] }>();

  constructor(public application: ApplicationInterface) {
    for (const server of this.application.servers) {
      if (server.accepts.includes(MethodEnum.SOCKET)) {
        this.dispatcher.subscribe('start', () =>
          server.start((request, socket) => {
            return this.socketHandler(new Requester(request), socket, new Responser(), server.options);
          }));
      } else {
        this.dispatcher.subscribe('start', () =>
          server.start((request) => {
            return this.httpHandler(new Requester(request), new Responser(), server.options);
          }));
      }
      this.dispatcher.subscribe('stop', () => server.stop());
    }

    for (const packName of application.packer.packs) {
      const pack = application.packer.container.construct<PackInterface>(packName);

      if (pack?.onBoot) this.dispatcher.subscribe('boot', pack?.onBoot);
      if (pack?.onStart) this.dispatcher.subscribe('start', pack?.onStart);
      if (pack?.onStop) this.dispatcher.subscribe('stop', pack?.onStop);
    }

    for (const [_method, routes] of Object.entries(this.application.router.routes)) {
      for (const route of routes) {
        this.applyWire(`${String(route.controller.key)}:${route.action.key}`, route)
      }
    }
  }

  private applyWire(key: string, route: RouteType) {
    if (this.application.middler.middlewares[key][EventEnum.AFTER]) {
      route.wired.try = this.nextMiddleware(EventEnum.AFTER, this.application.middler.middlewares[key], async function next(_context?: ContextType) {});
    }

    if (this.application.middler.middlewares[key][EventEnum.MIDDLE]) {
      route.wired.try = this.nextMiddleware(EventEnum.MIDDLE, this.application.middler.middlewares[key], route.wired.try);
    }

    if (this.application.middler.middlewares[key][EventEnum.BEFORE]) {
      route.wired.try = this.nextMiddleware(EventEnum.BEFORE, this.application.middler.middlewares[key], route.wired.try);
    }

    if (this.application.middler.middlewares[key][EventEnum.EXCEPTION]) {
      route.wired.catch = this.nextMiddleware(EventEnum.EXCEPTION, this.application.middler.middlewares[key], async function next(_context?: ContextType) {});
    }
  }

  private async httpHandler(
    requester: RequesterInterface,
    responser: ResponserInterface,
    server: ServerOptionsType,
  ): Promise<Response> {
    const route = this.application.router.find(requester.url, requester.method.toLowerCase() as any);
  
    if (!route) return new Response(null, { status: 404 });

    const url = route.pattern?.exec(requester.url) as URLPatternResult;
    const key = `${String(route.controller.key)}:${route.action.key}`;
    const container = this.application.packer.container.duplicate();

    const handler: HandlerType = {
      event: EventEnum.BEFORE, 
      attempts: 1, 
      error: undefined,
    }
    const context: ContextType = { 
      handler,
      requester,
      responser,
      container,
      route,
      server,
      url,
    }

    container.add([
      { name: 'Container', target: container },
      { name: 'Handler', target: handler },
      { name: 'Requester', target: requester },
      { name: 'Responser', target: responser },
      { name: 'Route', target: route },
      { name: 'Server', target: server },
      { name: 'Url', target: url },
    ], 'provider');

    await this.execute(key, route, context)

    return new Response(responser.parsed || responser.body, {
      status: responser.status,
      statusText: responser.statusText,
      headers: responser.headers,
    });
  }
  
  private async execute(key: string, route: RouteType, context: ContextType): Promise<void> {
    const attempts = context.handler.attempts;

    try {
      await route.wired.try(context)
    } catch (error) {
      context.handler.error = error
      await route.wired.catch(context)
    }

    if (context.handler.attempts !== attempts) {
      return this.execute(key, route, context);
    }
  }

  private async socketHandler(
    _request: RequesterInterface,
    _socket: WebSocket,
    _response: ResponserInterface,
    _server: ServerOptionsType,
  ): Promise<Response> {
    throw new Error('Not implemented');
  }

  private nextMiddleware(
    event: EventEnum,
    middlewares: MiddlerType,
    lastNext: NextFunctionType,
  ): NextFunctionType {
    return middlewares[event].reduce((a: NextFunctionType, b: MiddlewareInterface) => {
      return (function next(context: ContextType): Promise<void> {
        return b.onUse(context, () => a(context))
      }) as NextFunctionType;
    }, lastNext);
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
