import { PredicateInterface } from '~/querier/interfaces.ts';
import Predicate from '~/querier/services/clauses/predicate.service.ts';

export const isPredicate = (x: any): x is PredicateInterface<any> => {
  return x instanceof Predicate
}

export default isPredicate