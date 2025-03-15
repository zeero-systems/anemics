import type { InterceptorInterface } from '~/controller/interfaces.ts';
import type { EventType, OptionsType } from '~/controller/types.ts';

import { ConstructorType, Factory, List } from '@zxxxro/commons';

export class Interceptor {
  public static readonly middleware: unique symbol = Symbol('MIDDLEWARE');

  public static middlewares: Array<{ target: ConstructorType<InterceptorInterface>, options: OptionsType }> = []

  public static before: Array<InterceptorInterface> = []
  public static middle: Array<InterceptorInterface> = []
  public static after: Array<InterceptorInterface> = []
  public static error: Array<InterceptorInterface> = []

  public static exists(targetName: string | symbol, event: EventType): boolean {
    return Interceptor[event].some((interceptor) => interceptor.constructor.name == targetName)
  }

  public static construct(): void {

    for (const interceptor of Interceptor.middlewares.sort((ma, mb) => {
      return ma.options.weight - mb.options.weight
    })) {
      const middleware = Factory.construct(interceptor.target)
      const middlewareName = interceptor.target.name
      
      if(!Interceptor.exists(middlewareName, interceptor.options.event)) {
        Interceptor[interceptor.options.action](middleware, interceptor.options)
      }
    }
  }

  public static add(target: ConstructorType<InterceptorInterface>, options: OptionsType): void {
    Interceptor.middlewares.push({ target, options })
  }

  private static first(target: InterceptorInterface, options: OptionsType): void {
    Interceptor[options.event].unshift(target);
  }
  
  private static last(target: InterceptorInterface, options: OptionsType): void {
    Interceptor[options.event].push(target);
  }

  private static ordered(target: InterceptorInterface, options: OptionsType): void {
    let insertIndex = List.getSortedIndex(Interceptor[options.event], (current: any) => {
      const targetWeight = (target.weight || 0) || Interceptor[options.event].length;
      const currentWeight = current.weight || Interceptor[options.event].length;

      return currentWeight < targetWeight;
    });

    if (Interceptor[options.event][insertIndex]) insertIndex++; 

    Interceptor[options.event][insertIndex] = target;
  }

}

export default Interceptor;
