import type {
  AnnotationType,
  ContainerInterface,
  DecorationType,
  PackerInterface,
  PackNewableType,
  SpanInterface,
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
  Metadata,
  Packer,
  SpanEnum,
  StatusEnum,
  Tracer,
} from '@zeero/commons';

import Http from '~/network/services/http.service.ts';
import Middler from '~/controller/services/middler.service.ts';
import Router from '~/controller/services/router.service.ts';
import Ws from '~/network/services/ws.service.ts';
import EventEnum from '~/controller/enums/event.enum.ts';
import Resourcer from '~/resourcer/services/resourcer.service.ts';
import { ResourcerInterface } from '../../resourcer/interfaces.ts';

export class Application implements ApplicationInterface {
  public container!: ContainerInterface;
  public packer!: PackerInterface;
  public router!: RouterInterface;
  public middler!: MiddlerInterface;
  public tracer!: TracerInterface;
  public resourcer!: ResourcerInterface;
  public servers: Array<ServerInterface> = [];

  constructor(
    public pack: PackNewableType,
    public options: ApplicationOptionsType = { http: { name: 'Default', port: 3000 } },
  ) {

    this.container = new Container();
    this.container.add([{ name: 'Container', target: this.container }], 'provider');

    this.packer = new Packer(pack, this.container);    
    this.packer.unpack(this.pack);
    
    if (!this.container.collection.get('Resourcer')) {
      const resourcer = {
        name: 'Resourcer',
        target: new Resourcer({ service: { name: 'anemic', version: '0.20.0' } }),
      };
      this.packer.container.add([resourcer], 'provider');
    }

    this.resourcer = this.packer.container.construct<ResourcerInterface>('Resourcer') as ResourcerInterface;
    if (!this.container.collection.get('Tracer')) {
      const tracer = {
        name: 'Tracer',
        target: new Tracer({
          name: 'Anemic',
          transports: [new ConsoleTransport({ pretty: true })],
        }),
      };
      this.packer.container.add([tracer], 'provider');
      this.packer.container.add([tracer], 'consumer');
    }

    this.tracer = this.packer.container.construct<TracerInterface>('Tracer') as TracerInterface;
    
    const span = this.tracer.start({ name: 'application' })

    // @TODO better way to expose current package version
    this.tracer.info(`Anemic Framework v0.20.0`);
    this.tracer.info(`Running Deno v${Deno.version.deno} & Typescript v${Deno.version.typescript}`);
    
    this.setServers(span);
    this.setMiddlewares(span);
    this.setRoutes(span);

    this.packer.container.add([
      { name: 'Packer', target: this.packer },
      { name: 'Router', target: this.router },
      { name: 'Middler', target: this.middler },
    ], 'provider');
    
    const resources = this.resourcer.getResource();
    if (resources) {
      span.attributes(resources);
    }

    span.status({ type: StatusEnum.RESOLVED });
    span.end();
  }

  private setServers(span: SpanInterface): void {
    const child = span.child({ name: 'servers' })

    if (this.options.http) {
      child.attributes({ http: this.options.http });
      if (!Array.isArray(this.options.http)) this.options.http = [this.options.http];

      for (const option of this.options.http) {
        if (!option.onListen) {
          option.onListen = ({ transport, hostname, port }) => {
            const t = transport == 'tcp' ? 'http://' : `${transport}:`;
            child.info(`${option.name} start listening on ${t}${hostname}:${port} `);
          };
        }
        this.servers.push(new Http(option));
        child.info(`${option.name} configured as http`);
      }
      child.event({ name: 'http.configured', attributes: { count: this.options.http.length } });
    }

    if (this.options.socket) {
      child.attributes({ socket: this.options.socket });
      if (!Array.isArray(this.options.socket)) this.options.socket = [this.options.socket];

      for (const option of this.options.socket) {
        if (!option.onListen) {
          option.onListen = ({ hostname, port }) => {
            child.info(`${option.name} listening on 'wss://'${hostname}:${port} `);
          };
        }
        this.servers.push(new Ws(option));
        child.info(`${option.name} configured as socket`);
      }
      child.event({ name: 'socket.configured', attributes: { count: this.options.socket.length } });
    }

    child.status({ type: StatusEnum.RESOLVED });
    child.end();
  }

  private setMiddlewares(span: SpanInterface): void {
    const child = span.child({ name: 'middlewares' })
    const artifacts = this.packer.artifacts();

    if (this.options.middlewares) {
      this.container.add(this.options.middlewares.map((target) => ({ name: target.name, target })), 'consumer');

      for (const artifact of artifacts) {
        const controller = DecoratorMetadata.findByAnnotationInteroperableName(artifact.target, 'Controller');
        if (controller) {
          for (const middleware of this.options.middlewares) {
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

    child.info(`Global middlewares injected`);
    child.event({ name: 'middlewares.injected', attributes: { count: Object.keys(this.middler.middlewares).length } });

    child.status({ type: StatusEnum.RESOLVED });
    child.end();
  }

  private setRoutes(span: SpanInterface): void {
    const artifacts = this.packer.artifacts();

    const child = span.child({ name: 'router' });

    this.router = new Router();
    this.router.routerify(artifacts);

    for (const routes of Object.values(this.router.routes)) {
      for (const route of routes) {
        this.applyWire(`${String(route.controller.key)}:${route.action.key}`, route);
        child.info(`${route.action.method || route.action.namespace} ${route.pathname} registered`);
      }
    }

    child.event({ name: 'routes.routed', attributes: { count: this.router.size } });
    child.status({ type: StatusEnum.RESOLVED });
    child.end();
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
        let called = false;
        const span = context.span.child({ name: `middleware ${(b as any).name}`, kind: SpanEnum.INTERNAL });
        span.attributes({ middleware: (b as any).name, event });
        return b.onUse(context, () => {
          called = true;
          span.status({ type: StatusEnum.RESOLVED });
          span.end();

          return a(context)
        })
        .catch((error) => {
          span.attributes({ error: { name: error.name, message: error.message, cause: error.cause ?? 'unknown' } });
          span.status({ type: StatusEnum.REJECTED });
          throw error;
        })
        .finally(() => {
          if (!called) {
            span.end();
          }
        });
      }) as NextFunctionType;
    }, lastNext);
  }
}

export default Application;
