import { FilterPredicateType } from '~/persister/types.ts';

export const isFilterPredicate = (x: any): x is FilterPredicateType => {
  return !!x && !!(x.or || x.and)
}

export default isFilterPredicate