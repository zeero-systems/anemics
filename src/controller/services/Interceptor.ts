import type { MiddlewareInterface } from '~/controller/interfaces.ts';
import type { EventType, OptionsType } from '~/controller/types.ts';

import {  List} from '@zxxxro/commons';

export class Interceptor {
  public static readonly module: unique symbol = Symbol('INTERCEPTOR');

  public static before: Array<MiddlewareInterface> = []
  public static middle: Array<MiddlewareInterface> = []
  public static after: Array<MiddlewareInterface> = []
  public static error: Array<MiddlewareInterface> = []

  public static add(target: MiddlewareInterface, options: OptionsType = { event: 'middle', action: 'ordered' }): void {
    Interceptor[options.action](target, options)
  }

  public static exists(targetName: string | symbol, event: EventType): boolean {
    return Interceptor[event].some((interceptor) => interceptor.constructor.name == targetName)
  }

  private static first(target: MiddlewareInterface, options: OptionsType): void {
    Interceptor[options.event].unshift(target);
  }
  
  private static last(target: MiddlewareInterface, options: OptionsType): void {
    Interceptor[options.event].push(target);
  }

  private static ordered(target: MiddlewareInterface, options: OptionsType): void {
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
