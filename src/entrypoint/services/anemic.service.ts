import type { PackInterface } from '@zeero/commons';
import type { ServerOptionsType } from '~/network/types.ts';
import type { AnemicInterface, ApplicationInterface } from '~/entrypoint/interfaces.ts';
import type { RequesterInterface, ResponserInterface } from '~/network/interfaces.ts';
import type { ContextType, RouteType } from '~/controller/types.ts';
import type { HandlerType } from '~/entrypoint/types.ts';

import { Dispatcher } from '@zeero/commons';

import Responser from '~/network/services/responser.service.ts';
import Requester from '~/network/services/requester.service.ts';
import MethodEnum from '~/network/enums/method.enum.ts';
import EventEnum from '~/controller/enums/event.enum.ts';

export class Anemic implements AnemicInterface {
  private dispatcher = new Dispatcher<{ boot: []; start: []; stop: [] }>();

  constructor(public application: ApplicationInterface) {
    for (const packName of application.packer.packs) {
      const pack = application.packer.container.construct<PackInterface>(packName);

      if (pack?.onBoot) this.dispatcher.subscribe('boot', pack?.onBoot);
      if (pack?.onStart) this.dispatcher.subscribe('start', pack?.onStart);
      if (pack?.onStop) this.dispatcher.subscribe('stop', pack?.onStop);
    }

    for (const server of this.application.servers) {
      if (server.accepts.includes(MethodEnum.SOCKET)) {
        this.dispatcher.subscribe('start', () =>
          server.start((request, socket) => {
            return this.socketHandler(new Requester(request), new Responser(), socket, server.options);
          }));
      } else {
        this.dispatcher.subscribe('start', () =>
          server.start((request) => {
            return this.httpHandler(new Requester(request), new Responser(), server.options);
          }));
      }
      this.dispatcher.subscribe('stop', () => server.stop());
    }
  }

  private async httpHandler(
    requester: RequesterInterface,
    responser: ResponserInterface,
    server: ServerOptionsType,
  ): Promise<Response> {
    const method = requester.method.toLowerCase() as any;
    const route = this.application.router.routes[method]?.find((route) => route.pattern?.test(requester.url));

    if (!route) return new Response(null, { status: 404 });

    const container = this.application.packer.container.duplicate();

    const handler: HandlerType = { event: EventEnum.BEFORE, attempts: 1, error: undefined };
    const context: ContextType = { handler, requester, responser, container, route, server };

    container.collection.set('Context', { artifact: { name: 'Context', target: context }, tags: ['P'] });

    await this.execute(route, context);

    return new Response(responser.parsed || responser.body, {
      status: responser.status,
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

  private async socketHandler(
    _request: RequesterInterface,
    _response: ResponserInterface,
    _socket: WebSocket,
    _server: ServerOptionsType,
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
