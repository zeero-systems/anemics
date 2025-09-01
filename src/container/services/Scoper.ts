import type { DecorationType } from '~/decorator/types.ts';
import type { ConstructorType } from '~/common/types.ts';

import ScopeEnum from '~/container/enums/ScopeEnum.ts';

export class Scoper {
  public static readonly metadata: unique symbol = Symbol('Scoper.metadata');

  public static applyDecoration<P>(decoration: DecorationType<P>): void {
    if (decoration.property) {
      if (!decoration.context.metadata[Scoper.metadata]) {
        decoration.context.metadata[Scoper.metadata] = ScopeEnum.Transient;
      }
    }
  }

  public static applyMetadata<T extends ConstructorType<any>>(target: T): T {
    if (!target[Symbol.metadata]) {
      target[Symbol.metadata] = {}
    }

    // @ts-ignore we just applied the metadata object ...
    target[Symbol.metadata][Scoper.metadata] = ScopeEnum.Transient

    return target
  }

  public static setDecoration<P>(scope: ScopeEnum, decoration: DecorationType<P>): void {
    decoration.context.metadata[Scoper.metadata] = scope
  }

  public static setMetadata<T extends ConstructorType<any>>(scope: ScopeEnum, target: T): void {
    if (target[Symbol.metadata]) {
      // @ts-ignore we already confirmed the metadata
      target[Symbol.metadata][Scoper.metadata] = scope
    }
  }

  public static getMetadata(target: any): ScopeEnum {
    let scope = ScopeEnum.Transient;
    
    if (target[Symbol.metadata]) {
      scope = target[Symbol.metadata][Scoper.metadata]
    }

    return scope;
  }
}

export default Scoper;
