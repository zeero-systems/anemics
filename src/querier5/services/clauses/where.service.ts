import type { QuerierOptionsType } from '~/querier/types.ts';
import type { CommonInterface, PredicateInterface, RawInterface, WhereInterface } from '~/querier/interfaces.ts';
import type { BracketFunction, FirstTermType, OperatorType, SecondTermType } from '~/querier/types.ts';

import Predicate from '~/querier/services/clauses/predicate.service.ts';

export class Where<T extends CommonInterface> implements WhereInterface<T> {
  protected predicateWhere: PredicateInterface<T>

  constructor(protected query: T) {
    this.predicateWhere = new Predicate<T>(this.query, 'WHERE')
  }

  and(raw: RawInterface<T>): this & T;
  and(bracket: BracketFunction<T>): this & T;
  and(operator: OperatorType, bracket: BracketFunction<T>): this & T;
  and(operator: OperatorType, secondTerm?: SecondTermType): this & T;
  and(firstTerm: FirstTermType, operator: OperatorType, bracket: BracketFunction<T>): this & T;
  and(firstTerm: FirstTermType, operator: OperatorType, secondTerm?: SecondTermType): this & T;
  and(firstTerm: any, operator?: any, secondTerm?: any): this & T {
    this.predicateWhere.and(firstTerm, operator, secondTerm)
    return this.query.queue(this)
  }

  or(raw: RawInterface<T>): this & T;
  or(bracket: BracketFunction<T>): this & T;
  or(operator: OperatorType, bracket: BracketFunction<T>): this & T;
  or(operator: OperatorType, secondTerm?: SecondTermType): this & T;
  or(firstTerm: FirstTermType, operator: OperatorType, bracket: BracketFunction<T>): this & T;
  or(firstTerm: FirstTermType, operator: OperatorType, secondTerm?: SecondTermType): this & T;
  or(firstTerm: any, operator?: any, secondTerm?: any): this & T {
    this.predicateWhere.or(firstTerm, operator, secondTerm)
    return this.query.queue(this)
  }

  toWhereQuery(options: QuerierOptionsType): QuerierOptionsType {
    return this.predicateWhere.toPredicateQuery(options);
  }

}

export default Where;
