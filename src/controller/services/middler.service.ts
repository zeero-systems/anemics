import type { ArtifactType, DecoratorType } from '@zeero/commons';
import type { MiddlerInterface, MiddlewareInterface } from '~/controller/interfaces.ts';

import { DecoratorMetadata } from '@zeero/commons';

import isMiddleware from '~/controller/guards/is-middleware.guard.ts';
import EventEnum from '~/controller/enums/event.enum.ts';

export class Middler implements MiddlerInterface {
  static events = Object.values(EventEnum);

  public middlewares: { [key: string]: { [key in EventEnum]: Array<MiddlewareInterface> } } = {};

  constructor(artifacts: Array<ArtifactType>) {
    for (let index = 0; index < artifacts.length; index++) {
      const artifact = artifacts[index];
      const targetName = artifact.name;

      const decoratorMap = DecoratorMetadata.get(artifact.target);
      const constructorDecorators = decoratorMap.get('construct');

      let constructorMiddlewareDecorators: Array<DecoratorType> = [];
      if (constructorDecorators) {
        constructorMiddlewareDecorators = constructorDecorators.filter((decorator) =>
          isMiddleware(decorator.annotation.target)
        );
      }

      const constructorKey = String(targetName);
      const constructorMiddlewares = constructorMiddlewareDecorators.map((decorator: DecoratorType) => {
        return decorator.annotation.target as unknown as MiddlewareInterface;
      });

      for (const [targetPropertyKey, decorators] of decoratorMap) {
        if (targetPropertyKey != 'construct') {
          const key = `${constructorKey}:${String(targetPropertyKey)}`;

          if (constructorMiddlewares.length > 0) {
            this.middlewares[key] = Middler.events.reduce((prev, curr: any) => {
              prev[curr] = [];
              return prev;
            }, {} as any);

            for (const middleware of constructorMiddlewares) {
              this.middlewares[key][middleware.event || 'before'].push(middleware);
            }
          }

          for (const decorator of decorators) {
            if (isMiddleware(decorator.annotation.target)) {
              const middleware = decorator.annotation.target;
              this.middlewares[key][middleware.event || 'before'].push(middleware);
            }
          }
        }
      }
    }
  }

  filter(event: EventEnum, key: string): Array<MiddlewareInterface> {
    if (this.middlewares[key] && this.middlewares[key][event]) {
      return this.middlewares[key][event];
    }

    return [];
  }
}

export default Middler;
