import type { QueryFunction } from '~/querier/types.ts';

export const isQueryFunction = (x: any): x is QueryFunction<any> => {
  return !!x && typeof x === 'function'
}

export default isQueryFunction