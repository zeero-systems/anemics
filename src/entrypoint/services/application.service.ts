import type { NewableType, PackerInterface, PackInterface } from '@zeero/commons';
import type { ServerOptionsType } from '~/network/types.ts';
import type { ServerInterface } from '~/network/interfaces.ts';
import type { ApplicationInterface } from '~/entrypoint/interfaces.ts';
import type { MiddlerInterface, MiddlewareInterface, RouterInterface } from '~/controller/interfaces.ts';

import { Packer } from '@zeero/commons';

import Middler from '~/controller/services/middler.service.ts';
import Router from '~/controller/services/router.service.ts';
import Http from '~/network/services/http.service.ts';
import Ws from '~/network/services/ws.service.ts';

export class Application implements ApplicationInterface {
  public packer: PackerInterface
  public router: RouterInterface
  public middler: MiddlerInterface
  public servers: Array<ServerInterface> = []
  
  constructor(pack: NewableType<new (...args: any[]) => PackInterface>, options: {
    http?: Array<ServerOptionsType> | ServerOptionsType, 
    socket?: Array<ServerOptionsType> | ServerOptionsType,
    middlewares?: Array<MiddlewareInterface>
  } = { http: { port: 3000 } }) {
    this.packer = new Packer(pack as any)
    this.router = new Router(this.packer.artifacts())
    this.middler = new Middler(this.packer.artifacts())
    
    if (options.http) {
      if (!Array.isArray(options.http)) options.http = [options.http]

      for (const option of options.http) {
        if (!option.onListen) {
          option.onListen = ({ transport, hostname, port }) => { 
            const t = transport == 'tcp' ? 'http://' : `${transport}:`
            console.log(`Anemic Server Listening on ${t}${hostname}:${  port} `)
          }
        }
        this.servers.push(new Http(option))
      }
    }

    if (options.socket) {
      if (!Array.isArray(options.socket)) options.socket = [options.socket]

      for (const option of options.socket) {
        if (!option.onListen) {
          option.onListen = ({ transport, hostname, port }) => { 
            console.log(`Anemic Server Listening on 'wss://'${hostname}:${ port } `)
          }
        }
        this.servers.push(new Ws(option))
      }
    }

    if (options.middlewares) {
      for (const route of Object.values(this.middler.middlewares)) {
        for (const middleware of options.middlewares) {
          for (const event of middleware.events) {
            const alreadyExists = route[event].find((m: MiddlewareInterface) => m.name === middleware.name)
            
            if (!alreadyExists) {
              route[event].unshift(middleware)
            }
          }
        }
      }
    }
  }
}

export default Application
