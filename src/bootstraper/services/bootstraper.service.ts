import { ConstructorType, Container, KeyType } from '@zxxxro/commons';
import { Application } from '~/bootstraper/services/application.service.ts';

export class Bootstraper {
  public static create(artifact: ConstructorType<any>): Application {
    Application.container = Container.create('PERPETUAL')
    return new Application(Application.container.construct(artifact.name))
  }
}

export default Bootstraper