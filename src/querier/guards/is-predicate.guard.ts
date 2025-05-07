import { PredicateInterface } from '~/querier/interfaces.ts';
import Predicate from '~/querier/adapters/sql/predicate.service.ts';

export const isPredicate = (x: any): x is PredicateInterface => {
  return x instanceof Predicate
}

export default isPredicate