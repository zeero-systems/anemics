import { PredicateClauseInterface } from '~/querier/interfaces.ts';

export const isPredicate = (x: any): x is PredicateClauseInterface<any> => {
  return !!x && !!x.predicates
}

export default isPredicate