import { ConstructorType, Factory } from '@zxxxro/commons';
import { Application } from '~/server/services/Application.ts';

export class Bootstraper {
  public static create(target: ConstructorType<any>) {
    return new Application(Factory.construct(target))
  }
}

export default Bootstraper