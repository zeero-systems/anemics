import type { InterceptorInterface } from '~/controller/interfaces.ts';
import type { EventType, OptionsType } from '~/controller/types.ts';

import { ConstructorType, Factory } from '@zxxxro/commons';

export class Interceptor {
  public static readonly middleware: unique symbol = Symbol('MIDDLEWARE');

  public static middlewares: Array<{ target: ConstructorType<InterceptorInterface>, options: OptionsType }> = []

  public static then: Array<InterceptorInterface> = []
  public static catch: Array<InterceptorInterface> = []
  public static finally: Array<InterceptorInterface> = []

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
}

export default Interceptor;
