import { FirstTermType } from '~/querier/types.ts';

export const isFirstTerm = (x: any): x is FirstTermType => {
  return !!x && (
    ['string', 'boolean', 'number'].includes(typeof x) ||
    Array.isArray(x) && x.every(value => ['string', 'boolean', 'number'].includes(typeof value))
  )

}

export default isFirstTerm