import type { ArtifactType, DecoratorType } from '@zeero/commons';
import type { MiddlerInterface, MiddlewareInterface } from '~/controller/interfaces.ts';

import { DecoratorMetadata } from '@zeero/commons';
import EventEnum from '~/controller/enums/event.enum.ts';

import isMiddleware from '~/controller/guards/is-middleware.guard.ts';
import isController from '~/controller/guards/is-controller.guard.ts';

export class Middler implements MiddlerInterface {
  static events: Array<EventEnum> = Object.values(EventEnum);

  public middlewares: { [key: string]: { [key in EventEnum]: Array<MiddlewareInterface> } } = {};

  constructor() {}

  public wirefy(artifacts: Array<ArtifactType>): void {
    for (const artifact of artifacts) {
      const targetName = artifact.name;

      const decoratorMap = DecoratorMetadata.get(artifact.target);
      const constructorKey = String(targetName);
      const constructorDecorators = decoratorMap.get('construct') || [];

      const controller: DecoratorType | undefined = constructorDecorators.find((decorator: DecoratorType) =>
        isController(decorator.annotation.target)
      );
      const decorators = constructorDecorators.filter((decorator: DecoratorType) =>
        isMiddleware(decorator.annotation.target)
      ) as unknown as { annotation: { target: MiddlewareInterface } }[];

      if (controller) {
        for (const [targetPropertyKey] of decoratorMap) {
          if (targetPropertyKey != 'construct') {
            const key = `${constructorKey}:${String(targetPropertyKey)}`;
            this.middlewares[key] = Middler.events.reduce((prev, curr: any) => {
              prev[curr] = [];
              return prev;
            }, {} as any);

            for (const decorator of decorators) {
              for (const event of decorator.annotation.target.events) {
                this.middlewares[key][event].push(decorator.annotation.target);
              }
            }

            const methodDecorators = DecoratorMetadata.filterByTargetPropertyKeys(artifact.target, [targetPropertyKey])
              .filter((decorator: DecoratorType) => {
                return isMiddleware(decorator.annotation.target);
              }) as unknown as { annotation: { target: MiddlewareInterface } }[];

            for (const decorator of methodDecorators) {
              for (const event of decorator.annotation.target.events) {
                this.middlewares[key][event].push(decorator.annotation.target);
              }
            }
          }
        }
      }
    }
  }
}

export default Middler;
