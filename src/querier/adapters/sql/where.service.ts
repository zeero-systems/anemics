import { PredicateInterface, QuerierInterface, RawInterface, WhereInterface } from '~/querier/interfaces.ts';
import { BracketFunction, FirstTermType, OperatorType, QueryOptionType, QueryType, SecondTermType, SubQueryType } from '~/querier/types.ts';
import Predicate from '~/querier/adapters/sql/predicate.service.ts';

export class Where implements WhereInterface {
  protected predicate: PredicateInterface

  constructor(protected query: QuerierInterface) {
    this.predicate = new Predicate(query, 'WHERE')
  }

  hasPredicates(): boolean {
    return this.predicate.hasPredicates()
  }

  and(raw: RawInterface): this & QuerierInterface;
  and(bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  and(operator: OperatorType, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  and(operator: OperatorType, secondTerm?: SecondTermType): this & QuerierInterface;
  and(firstTerm: FirstTermType, operator: OperatorType, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  and(firstTerm: FirstTermType, operator: OperatorType, secondTerm?: SecondTermType): this & QuerierInterface;
  and(firstTerm: any, operator?: any, secondTerm?: any): this & QuerierInterface {
    this.query.useClause(this)
    return this.predicate.and(firstTerm, operator, secondTerm) as any
  }

  or(raw: RawInterface): this & QuerierInterface;
  or(bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  or(operator: OperatorType, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  or(operator: OperatorType, secondTerm?: SecondTermType): this & QuerierInterface;
  or(firstTerm: FirstTermType, operator: OperatorType, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  or(firstTerm: FirstTermType, operator: OperatorType, secondTerm?: SecondTermType): this & QuerierInterface;
  or(firstTerm: any, operator?: any, secondTerm?: any): this & QuerierInterface {
    this.query.useClause(this)
    return this.predicate.or(firstTerm, operator, secondTerm) as any
  }
  
  toPredicateQuery(options: QueryOptionType): QueryType {
    return this.predicate.toPredicateQuery(options);
  }

  toWhereQuery(options: QueryOptionType): QueryType {
    return this.toPredicateQuery(options)
  }

}

export default Where;
