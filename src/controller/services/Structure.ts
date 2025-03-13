import { ConstructorType } from '@zxxxro/commons';

export class Structure {
  public static readonly module: unique symbol = Symbol('PAYLOAD')

  public static models: Map<string | symbol, ConstructorType<any>> = new Map();
  
  public static set(targetName: string | symbol, target: ConstructorType<any>): Map<string | symbol, ConstructorType<any>> {
    return Structure.models.set(targetName, target)
  }
}

export default Structure