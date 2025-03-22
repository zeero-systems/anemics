import { ConstructorType, Container, KeyType } from '@zxxxro/commons';
import { Application } from '~/bootstraper/services/application.service.ts';

export class Bootstraper {
  public static create(artifact: ConstructorType<any>): Application {
    const container = Container.create('PERPETUAL')
    return new Application(container.construct(artifact.name), container)
  }
}

export default Bootstraper