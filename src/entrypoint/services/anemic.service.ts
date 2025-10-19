import type { PackInterface } from '@zeero/commons';
import type { ServerOptionsType } from '~/network/types.ts';
import type { AnemicInterface, ApplicationInterface } from '~/entrypoint/interfaces.ts';
import type { MiddlewareInterface } from '~/controller/interfaces.ts';
import type { RequesterInterface, ResponserInterface } from '~/network/interfaces.ts';
import type { ContextType, MiddlerType, NextFunctionType } from '~/controller/types.ts';

import { Dispatcher } from '@zeero/commons';

import Responser from '~/network/services/responser.service.ts';
import Requester from '~/network/services/requester.service.ts';
import MethodEnum from '~/network/enums/method.enum.ts';
import EventEnum from '~/controller/enums/event.enum.ts';


export class Anemic implements AnemicInterface {
  private dispatcher = new Dispatcher<{
    boot: [ApplicationInterface];
    start: [ApplicationInterface];
    stop: [ApplicationInterface];
  }>();

  constructor(public application: ApplicationInterface) {
    for (const server of this.application.servers) {
      // @TODO optmize middlewares caching this.execute for each route before find
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

    container.add([
      { name: 'Requester', target: requester },
      { name: 'Responser', target: responser },
      { name: 'Server', target: server },
      { name: 'Url', target: url },
    ], 'provider');

    const handler = { attempts: 1, error: undefined };
    const context: ContextType = {
      event: EventEnum.BEFORE,
      requester,
      responser,
      container,
      route,
      server,
      url,
      handler,
    };

    await this.execute(key, context);

    return new Response(responser.parsed || responser.body, {
      status: responser.status,
      statusText: responser.statusText,
      headers: responser.headers,
    });
  }

  private async execute(key: string, context: ContextType): Promise<void> {
    const attempts = context.handler.attempts;

    try {
      let next: NextFunctionType = async () => {};

      if (this.application.middler.middlewares[key][EventEnum.AFTER]) {
        next = this.nextMiddleware(EventEnum.AFTER, context, this.application.middler.middlewares[key], next);
      }

      if (this.application.middler.middlewares[key][EventEnum.MIDDLE]) {
        next = this.nextMiddleware(EventEnum.MIDDLE, context, this.application.middler.middlewares[key], next);
      }

      if (this.application.middler.middlewares[key][EventEnum.BEFORE]) {
        next = this.nextMiddleware(EventEnum.BEFORE, context, this.application.middler.middlewares[key], next);
      }

      await next();
    } catch (error: any) {
      let next: NextFunctionType = async () => {};

      context.handler.error = error;

      if (this.application.middler.middlewares[key][EventEnum.EXCEPTION]) {
        next = this.nextMiddleware(EventEnum.EXCEPTION, context, this.application.middler.middlewares[key], next);
      }

      await next();
    }

    if (context.handler.attempts !== attempts) {
      return this.execute(key, context);
    }
  }

  private async socketHandler(
    request: RequesterInterface,
    socket: WebSocket,
    response: ResponserInterface,
    server: ServerOptionsType,
  ): Promise<Response> {
    throw new Error('Not implemented');
  }

  private nextMiddleware(
    event: EventEnum,
    context: ContextType,
    middlewares: MiddlerType,
    lastNext: NextFunctionType,
  ): NextFunctionType {
    return middlewares[event].reduce((a: NextFunctionType, b: MiddlewareInterface) => {
      return (async (): Promise<void> => {
        return await b.onUse({ ...context, event }, a);
      }) as NextFunctionType;
    }, lastNext);
  }

  public async boot(): Promise<void> {
    return this.dispatcher.dispatch('boot', this.application);
  }

  public async start(): Promise<void> {
    return this.dispatcher.dispatch('start', this.application);
  }

  public async stop(): Promise<void> {
    return this.dispatcher.dispatch('stop', this.application);
  }
}

export default Anemic;
