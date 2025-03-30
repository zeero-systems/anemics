import { BracketFunction, SubQueryType } from '~/querier/types.ts';

export const isBracket = (x: any): x is BracketFunction<SubQueryType> => {
  return !!x && typeof x === 'function'
}

export default isBracket