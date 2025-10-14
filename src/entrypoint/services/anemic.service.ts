import type { PackInterface} from '@zeero/commons';
import type { EventType } from '~/entrypoint/types.ts';
import type { ServerOptionsType } from '~/network/types.ts';
import type { AnemicInterface, ApplicationInterface } from '~/entrypoint/interfaces.ts';
import type { MiddlewareInterface } from '~/controller/interfaces.ts';
import type { RequestInterface } from '~/network/interfaces.ts';
import type { ContextType, NextFunctionType } from '~/controller/types.ts';

import { Dispatcher } from '@zeero/commons';

import Responser from '~/network/services/response.service.ts';
import MethodEnum from '~/network/enums/method.enum.ts';
import EventEnum from '~/controller/enums/event.enum.ts';

export class Anemic implements AnemicInterface {
  private dispatcher = new Dispatcher<EventType>()
  
  constructor(public application: ApplicationInterface) {
    for(const server of this.application.servers) {
      if (server.accepts.includes(MethodEnum.SOCKET)) {
        this.dispatcher.subscribe('start', () => server.start((socket) => this.socketHandler(socket, server.options)))
      } else {
        this.dispatcher.subscribe('start', () => server.start((request) => this.httpHandler(request, server.options)))
      }
      this.dispatcher.subscribe('stop', () => server.stop())
    }

    for(const packName of application.packer.packs) {
      const pack = application.packer.container.construct<PackInterface>(packName)
      
      if (pack?.onBoot) this.dispatcher.subscribe('boot', pack?.onBoot)
      if (pack?.onStart) this.dispatcher.subscribe('start', pack?.onStart)
      if (pack?.onStop) this.dispatcher.subscribe('stop', pack?.onStop)
    }
  }

  private async httpHandler(request: RequestInterface, server: ServerOptionsType): Promise<Response> {
    const route = this.application.router.find(request.url, request.method.toLowerCase() as any)

    if (!route) return new Response(null, { status: 404 })
    
    const url = route.pattern?.exec(request.url) as URLPatternResult
    const key = `${String(route.controller.key)}:${route.action.key}`
    const container = this.application.packer.container.duplicate()
    const response = new Responser()
    
    container.add([
      { name: 'Request', target: request },
      { name: 'Response', target: response },
      { name: 'Server', target: server },
      { name: 'Url', target: url },
    ], 'provider')

    let next: NextFunctionType = async () => {}
    const context = { request, response, container, route, server, url }

    if (this.application.middler.middlewares[key][EventEnum.BEFORE]) {
      next = this.nextMiddleware(context, this.application.middler.middlewares[key][EventEnum.BEFORE], next)     
    }

    if (this.application.middler.middlewares[key][EventEnum.MIDDLE]) {
      next = this.nextMiddleware(context, this.application.middler.middlewares[key][EventEnum.MIDDLE], next)     
    }
    
    if (this.application.middler.middlewares[key][EventEnum.AFTER]) {
      next = this.nextMiddleware(context, this.application.middler.middlewares[key][EventEnum.AFTER], next)
    }
      
    await next()

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }

  private async socketHandler(socket: WebSocket, server: ServerOptionsType): Promise<Response> {
    // @TODO implement
    throw new Error('Not implemented')    
  }
  
  private nextMiddleware(context: ContextType, middlewares: MiddlewareInterface[], lastNext: NextFunctionType): NextFunctionType {
    return middlewares.reduce((a: NextFunctionType, b: MiddlewareInterface) => {
      return (async (): Promise<void> => {
        return await b.onUse(context, a)
      }) as NextFunctionType
    }, lastNext)
  }
  
  public async boot() {
    return this.dispatcher.dispatch('boot', this.application)
  }

  public async start() {
    return this.dispatcher.dispatch('start', this.application)
  }

  public async stop() {
    return this.dispatcher.dispatch('stop', this.application)
  }
}

export default Anemic;
