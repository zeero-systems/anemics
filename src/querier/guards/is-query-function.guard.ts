import type { QueryFunction } from '~/querier/types.ts';
import type { BuilderInterface } from '~/querier/interfaces.ts';

export const isQueryFunction = <T extends BuilderInterface<T> = any>(x: any): x is QueryFunction<T> => {
  return !!x && typeof x === 'function'
}

export default isQueryFunction