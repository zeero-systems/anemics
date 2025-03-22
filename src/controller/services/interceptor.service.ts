import type { EventType } from '~/controller/types.ts';

import { ArtifactType, Container, ContainerInterface, Decorator, KeyType } from '@zxxxro/commons';
import { Intercept } from '~/controller/annotations/intercept.annotation.ts';

export class Interceptor {
  public static readonly tag: unique symbol = Symbol('Interceptor.tag');

  public static readonly thenTag: unique symbol = Symbol('Interceptor.thenTag');
  public static readonly catchTag: unique symbol = Symbol('Interceptor.catchTag');
  public static readonly finallyTag: unique symbol = Symbol('Interceptor.finallyTag');

  public static sort(artifacts: Array<[KeyType, ArtifactType]>) {
    return artifacts
  }

  public static construct(container: ContainerInterface): void {
    for (const event of ['then', 'catch', 'finally'] as Array<EventType>) {
      const tag = Interceptor[`${event}Tag`];
      const artifacts = Container.artifactsByTag.get(tag)

      if (artifacts) {
        const entries = artifacts?.entries().toArray()
        const sorteds = entries.sort((ia, ib) => {
          const iaa = Decorator.getDecoration(ia[1].target, Intercept, 'construct');
          const iab = Decorator.getDecoration(ib[1].target, Intercept, 'construct');
    
          return iaa?.parameters?.weight - iab?.parameters?.weight;
        });

        Container.artifactsByTag.set(tag, new Map(sorteds));

        sorteds.forEach(([key]) => container.construct(key)) 
      }
    }
  }
}

export default Interceptor;
