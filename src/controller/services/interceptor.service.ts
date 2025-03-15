import type { InterceptorInterface } from '~/controller/interfaces.ts';
import type { ActionType, EventType, OptionsType } from '~/controller/types.ts';

import { ConstructorType, Exception, Factory, List } from '@zxxxro/commons';

export class Interceptor {
  public static readonly middleware: unique symbol = Symbol('MIDDLEWARE');

  public static middlewares: Array<ConstructorType<InterceptorInterface>> = []

  public static before: Array<InterceptorInterface> = []
  public static middle: Array<InterceptorInterface> = []
  public static after: Array<InterceptorInterface> = []
  public static error: Array<InterceptorInterface> = []

  public static exists(targetName: string | symbol, event: EventType): boolean {
    return Interceptor[event].some((interceptor) => interceptor.constructor.name == targetName)
  }

  public static construct(): void {
    
    for (const constructable of Interceptor.middlewares) {
      const middleware = Factory.construct(constructable)
      const middlewareName = constructable.name
      
      if (!middleware.event) {
        throw new Exception(`The {name} do not have a middleware annotation.`, {
          key: 'NOT_IMPLEMENTED',
          context: { name: middlewareName, kind: 'class' },
        });
      }
      
      if(!Interceptor.exists(middlewareName, middleware.event)) {
        const middlewareAction = middleware.action as ActionType
        Interceptor[middlewareAction](middleware, { action: middlewareAction, event: middleware.event })
      }
    }
  }

  public static add(target: ConstructorType<InterceptorInterface>): void {
    Interceptor.middlewares.push(target)
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
