import type { AnnotationType, DecorationType, NewableType, PackerInterface, PackInterface, TimerInterface } from '@zeero/commons';
import type { ServerOptionsType } from '~/network/types.ts';
import type { ServerInterface } from '~/network/interfaces.ts';
import type { ApplicationInterface } from '~/entrypoint/interfaces.ts';
import type { MiddlerInterface, MiddlewareInterface, RouterInterface } from '~/controller/interfaces.ts';

import { Decorator, DecoratorMetadata, Metadata, Packer, Timer } from '@zeero/commons';

import Http from '~/network/services/http.service.ts';
import Middler from '~/controller/services/middler.service.ts';
import Router from '~/controller/services/router.service.ts';
import Ws from '~/network/services/ws.service.ts';

export class Application implements ApplicationInterface {
  public packer: PackerInterface
  public router: RouterInterface
  public middler: MiddlerInterface
  public timer: TimerInterface
  public servers: Array<ServerInterface> = []
  
  constructor(pack: NewableType<new (...args: any[]) => PackInterface>, options: {
    http?: Array<ServerOptionsType> | ServerOptionsType, 
    socket?: Array<ServerOptionsType> | ServerOptionsType,
    middlewares?: Array<NewableType<new (...args: any[]) => MiddlewareInterface>>
  } = { http: { port: 3000 } }) {

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

    this.packer = new Packer(pack)

    if (options?.middlewares) {
      
      this.packer.container.add(options.middlewares.map((target) => ({ name: target.name, target })), 'consumer')
      
      this.packer.container.collection.forEach((value) => {      
        const decorator = DecoratorMetadata.findByAnnotationInteroperableName(value.artifact.target, 'Controller')
        if (decorator) {

          for (const middleware of options.middlewares || []) {

            if (!Metadata.has(value.artifact.target)) {
              Metadata.set(value.artifact.target)
            }

            const annotation: AnnotationType = {
              name: middleware.name,
              target: this.packer.container.construct(middleware.name) as any
            }

            const decoration: DecorationType = {
              kind: 'class',
              property: 'construct',
              context: {
                name: 'construct',
                metadata: Metadata.get(value.artifact.target) as any,
                kind: 'class',
                addInitializer: () => {}
              }
            }

            
            Decorator.attach(value.artifact.target, annotation, decoration)
          }
        }
      })
    }

    const artifacts = this.packer.artifacts()

    this.router = new Router(artifacts)
    this.middler = new Middler(artifacts)
    this.timer = new Timer()
          
    this.packer.container.add([
      { name: 'Servers', target: { http: options.http, socket: options.socket } },
      { name: 'Packer', target: this.packer },
      { name: 'Router', target: this.router },
      { name: 'Middler', target: this.middler },
      { name: 'Timer', target: this.timer }
    ], 'provider');
  }
}

export default Application
