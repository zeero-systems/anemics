import type { MiddlewareInterface } from '~/interceptor/interfaces.ts';

import { ConstructorType, List } from '@zxxxro/commons';

export class Interceptor {
  public static readonly module: unique symbol = Symbol('INTERCEPTOR')

  public static middlewares: Array<ConstructorType<MiddlewareInterface>> = [];
  
  public static first(target: ConstructorType<MiddlewareInterface>): void {
    Interceptor.middlewares.unshift(target)
  }

  public static last(target: ConstructorType<MiddlewareInterface>): void {
    Interceptor.middlewares.push(target)
  }

  public static weight(target: ConstructorType<MiddlewareInterface>): void {
    const insertIndex = List.getSortedIndex(Interceptor.middlewares, (current: any) => {
      // @ts-ignore weight its a static value
      const targetWeight = target.weigth || Interceptor.middlewares.length
      const currentWeight = current.weigth || Interceptor.middlewares.length
      
      return currentWeight < targetWeight
    })
    
    Interceptor.middlewares[insertIndex] = target
  }

}

export default Interceptor