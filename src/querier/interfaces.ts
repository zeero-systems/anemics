import {
  BracketFunction,
  FirstTermType,
  JoinKeyType,
  JoinType,
  OperatorType,
  PredicateKeyType,
  QueryOptionType,
  QueryEventHanderType,
  QueryType,
  SecondTermType,
  SelectType,
  SubQueryType,
  TableType,
} from '~/querier/types.ts';

export interface QueryInterface {
  toQuery(options: QueryOptionType): QueryType;
}

export interface ClauseInterface {
  [key: string]: any;
}

export interface TableInterface extends ClauseInterface {
  hasTables(): boolean;

  table(raw: RawInterface): this & QuerierInterface;
  table(alias: string, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  table(name: string, alias?: string): this & QuerierInterface;

  toTableQuery(options: QueryOptionType): QueryType;
}

export interface FromInterface extends TableInterface, ClauseInterface {

}

export interface SelectInterface extends ClauseInterface {
  hasSelects(): boolean;

  column(raw: RawInterface): this & QuerierInterface;
  column(alias: string, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  column(name: string, alias?: string): this & QuerierInterface;

  toSelectQuery(options: QueryOptionType): QueryType;
}

export interface WhereInterface extends PredicateInterface, ClauseInterface {
  
}

export interface JoinInterface extends TableInterface, ClauseInterface {
  on: PredicateInterface;
  using: PredicateInterface;
  where: PredicateInterface;
}

export interface PredicateInterface extends ClauseInterface {
  hasPredicates(): boolean;

  and(raw: RawInterface): this & QuerierInterface;
  and(bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  and(operator: OperatorType, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  and(operator: OperatorType, secondTerm?: SecondTermType): this & QuerierInterface;
  and(
    firstTerm: FirstTermType,
    operator: OperatorType,
    bracket: BracketFunction<SubQueryType>,
  ): this & QuerierInterface;
  and(firstTerm: FirstTermType, operator: OperatorType, secondTerm?: SecondTermType): this & QuerierInterface;

  or(raw: RawInterface): this & QuerierInterface;
  or(bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  or(operator: OperatorType, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  or(operator: OperatorType, secondTerm?: SecondTermType): this & QuerierInterface;
  or(firstTerm: FirstTermType, operator: OperatorType, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  or(firstTerm: FirstTermType, operator: OperatorType, secondTerm?: SecondTermType): this & QuerierInterface;

  toPredicateQuery(options: QueryOptionType): QueryType;
}

// export interface JoinInterface extends ClauseInterface {
//   joins: Array<JoinType>;

//   inner: JoinPredicateInterface;
//   left: JoinPredicateInterface;

//   toJoinQuery(options: QueryOptionType): QueryType;
// }

// export interface JoinPredicateInterface extends TableInterface {
//   on: () => JoinInterface & PredicateInterface;
//   using: () => JoinInterface & PredicateInterface;
//   where: () => JoinInterface & PredicateInterface;
// }

export interface OrderInterface extends ClauseInterface {
  hasOrders(): boolean;

  asc(raw: RawInterface): this & QuerierInterface;
  asc(name: string): this & QuerierInterface;

  desc(raw: RawInterface): this & QuerierInterface;
  desc(name: string): this & QuerierInterface;

  toOrderQuery(options: QueryOptionType): QueryType;
}

export interface RawInterface {
  hasRaw(): boolean;
  toRawQuery(options: QueryOptionType): QueryType;
}

export interface RawwerInterface {
  text: (value: string) => QuerierInterface
}

export interface QuerierInterface {
  syntax: 'SQL';

  from: FromInterface;
  select: SelectInterface;  
  where: WhereInterface;
  inner: JoinInterface;
  left: JoinInterface;
  order: OrderInterface;
  raw: RawwerInterface;

  clauses: Array<ClauseInterface>;

  useClause: (clause: ClauseInterface) => ClauseInterface;
  toQuery: (options?: QueryOptionType) => QueryType;
}

export default {};
