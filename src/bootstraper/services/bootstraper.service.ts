import { ConstructorType, Factory } from '@zxxxro/commons';
import { Application } from '~/bootstraper/services/application.service.ts';

export class Bootstraper {
  
  public static create(target: ConstructorType<any>): Application {
    return new Application(Factory.construct(target))
  }
}

export default Bootstraper