import { BracketFunction } from '~/querier/types.ts';

export const isBracket = (x: any): x is BracketFunction<any> => {
  return !!x && typeof x === 'function'
}

export default isBracket