import type {
  AnnotationType,
  ContainerInterface,
  DecorationType,
  PackerInterface,
  PackNewableType,
  TracerInterface,
} from '@zeero/commons';

import type { ServerInterface } from '~/network/interfaces.ts';
import type { ApplicationOptionsType } from '~/entrypoint/types.ts';
import type { ApplicationInterface } from '~/entrypoint/interfaces.ts';
import type { MiddlerInterface, MiddlewareInterface, RouterInterface } from '~/controller/interfaces.ts';
import type { ContextType, MiddlerType, NextFunctionType, RouteType } from '~/controller/types.ts';

import {
  ConsoleTransport,
  Container,
  Decorator,
  DecoratorMetadata,
  LogLevelEnum,
  Metadata,
  Packer,
  Text,
  Tracer,
} from '@zeero/commons';

import Http from '~/network/services/http.service.ts';
import Middler from '~/controller/services/middler.service.ts';
import Router from '~/controller/services/router.service.ts';
import Ws from '~/network/services/ws.service.ts';
import EventEnum from '~/controller/enums/event.enum.ts';

export class Application implements ApplicationInterface {
  public container!: ContainerInterface;
  public packer!: PackerInterface;
  public router!: RouterInterface;
  public middler!: MiddlerInterface;
  public tracer!: TracerInterface;
  public servers: Array<ServerInterface> = [];

  constructor(
    pack: PackNewableType,
    options: ApplicationOptionsType = { http: { name: 'Default', port: 3000 } },
  ) {
    this.container = new Container();
    this.container.add([{ name: 'Container', target: this.container }], 'provider');

    this.packer = new Packer(pack, this.container);

    this.setLogger(options);
    this.setPacks(pack, options);
    this.setMiddlewares(options);
    this.setRoutes(options);
    this.setServers(options);

    this.packer.container.add([
      { name: 'Packer', target: this.packer },
      { name: 'Router', target: this.router },
      { name: 'Middler', target: this.middler },
    ], 'provider');
  }

  private setLogger(options: ApplicationOptionsType) {
    const name = options.tracer?.name || 'Tracer';

    if (!this.container.collection.get(name)) {
      const logger = {
        name,
        target: new Tracer({
          level: options.tracer?.level || LogLevelEnum.DEBUG,
          transports: [new ConsoleTransport()],
          namespaces: ['Anemic'],
        }),
      };
      this.packer.container.add([logger], 'provider');
      this.packer.container.add([logger], 'consumer');
    }
  }

  private setPacks(pack: PackNewableType, options: ApplicationOptionsType): void {
    const name = options.tracer?.name || 'Tracer';

    this.packer = new Packer(pack, this.container);
    this.tracer = this.packer.container.construct<TracerInterface>(name) as TracerInterface;

    // @TODO better way to expose current package version
    this.tracer.info(`Anemic Framework v0.20.0`);
    this.tracer.info(`Running Deno v${Deno.version.deno} & Typescript v${Deno.version.typescript}`);

    const packerTracer = this.tracer.child({ namespaces: ['Packer'] });

    this.packer.dispatcher.subscribe('unpacked', (pack: PackNewableType) => {
      packerTracer.info(`${pack.name} dependencies unpacked`);
    });

    this.packer.unpack(pack);
  }

  private setServers(options: ApplicationOptionsType): void {
    const serverTracer = this.tracer.child({ namespaces: ['Server'] });

    if (options.http) {
      if (!Array.isArray(options.http)) options.http = [options.http];

      for (const option of options.http) {
        if (!option.onListen) {
          option.onListen = ({ transport, hostname, port }) => {
            const t = transport == 'tcp' ? 'http://' : `${transport}:`;
            serverTracer.info(`${option.name} start listening on ${t}${hostname}:${port} `);
          };
        }
        this.servers.push(new Http(option));
        serverTracer.info(`Http ${option.name} configured`);
      }
    }

    if (options.socket) {
      if (!Array.isArray(options.socket)) options.socket = [options.socket];

      for (const option of options.socket) {
        if (!option.onListen) {
          option.onListen = ({ hostname, port }) => {
            serverTracer.info(`${option.name} listening on 'wss://'${hostname}:${port} `);
          };
        }
        this.servers.push(new Ws(option));
        serverTracer.info(`Socket ${option.name} configured`);
      }
    }
  }

  private setMiddlewares(options: ApplicationOptionsType): void {
    const artifacts = this.packer.artifacts();

    if (options.middlewares) {
      this.container.add(options.middlewares.map((target) => ({ name: target.name, target })), 'consumer');

      for (const artifact of artifacts) {
        const controller = DecoratorMetadata.findByAnnotationInteroperableName(artifact.target, 'Controller');
        if (controller) {
          for (const middleware of options.middlewares) {
            if (!Metadata.has(artifact.target)) {
              Metadata.set(artifact.target);
            }

            const annotation: AnnotationType = {
              name: middleware.name,
              target: this.container.construct(middleware.name) as any,
            };

            const decoration: DecorationType = {
              kind: 'class',
              property: 'construct',
              context: {
                name: 'construct',
                metadata: Metadata.get(artifact.target) as any,
                kind: 'class',
                addInitializer: () => {},
              },
            };

            Decorator.attach(artifact.target, annotation, decoration);
          }
        }
      }
    }

    this.middler = new Middler();
    this.middler.wirefy(artifacts);
  }

  private setRoutes(_options: ApplicationOptionsType): void {
    const artifacts = this.packer.artifacts();

    this.router = new Router();

    const packerTracer = this.tracer.child({ namespaces: ['Router'] });

    this.router.dispatcher.subscribe('routed', (route: RouteType) => {
      this.applyWire(`${String(route.controller.key)}:${route.action.key}`, route);
      packerTracer.info(
        `${Text.toFirstLetterUppercase(route.action.method || route.action.namespace)} ${route.pathname} routed`,
      );
    });

    this.router.routerify(artifacts);
  }

  private applyWire(key: string, route: RouteType): void {
    route.wired.try = async function next(_context?: ContextType) {};

    if (this.middler.middlewares[key][EventEnum.AFTER]) {
      route.wired.try = this.nextMiddleware(EventEnum.AFTER, this.middler.middlewares[key], route.wired.try);
    }

    if (this.middler.middlewares[key][EventEnum.MIDDLE]) {
      route.wired.try = this.nextMiddleware(EventEnum.MIDDLE, this.middler.middlewares[key], route.wired.try);
    }

    if (this.middler.middlewares[key][EventEnum.BEFORE]) {
      route.wired.try = this.nextMiddleware(EventEnum.BEFORE, this.middler.middlewares[key], route.wired.try);
    }

    route.wired.catch = async function next(_context?: ContextType) {};

    if (this.middler.middlewares[key][EventEnum.EXCEPTION]) {
      route.wired.catch = this.nextMiddleware(EventEnum.EXCEPTION, this.middler.middlewares[key], route.wired.catch);
    }
  }

  private nextMiddleware(
    event: EventEnum,
    middlewares: MiddlerType,
    lastNext: NextFunctionType,
  ): NextFunctionType {
    return middlewares[event].reduce((a: NextFunctionType, b: MiddlewareInterface) => {
      return (function next(context: ContextType): Promise<void> {
        context.handler.event = event;
        return b.onUse(context, () => a(context));
      }) as NextFunctionType;
    }, lastNext);
  }
}

export default Application;
