import {
  BracketFunction,
  FieldType,
  FromStatementType,
  JoinStatementType,
  OrderStatementType,
  OperatorType,
  QueryArgType,
  QueryType,
  SelectStatementType,
  TableType,
  SecondTermType,
  FirstTermType,
  SubQueryType,
  StatementType,
  JoinPredicateType,
} from '~/querier/types.ts';

export interface QueryInterface {
  toQuery(options: QueryArgType): QueryType;
}

export interface FromInterface extends QueryInterface {
  query: QuerierInterface;
  statement: Array<FromStatementType>;

  table(alias: string, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  table(name: string, alias?: string): this & QuerierInterface;

  tables(tables: Array<string | TableType>): this & QuerierInterface;
}

export interface SelectInterface extends QueryInterface {
  query: QuerierInterface;
  statement: SelectStatementType;

  column(alias: string, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  column(name: string, alias?: string): this & QuerierInterface;

  columns(columns: Array<string | FieldType>): this & QuerierInterface;

  distinct(): this & QuerierInterface;
}

export interface PredicateStatementInterface {
  and(bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  and(operator: OperatorType, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  and(operator: OperatorType, secondTerm?: SecondTermType): this & QuerierInterface;
  and(firstTerm: FirstTermType, operator: OperatorType, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  and(firstTerm: FirstTermType, operator: OperatorType, secondTerm?: SecondTermType): this & QuerierInterface;

  or(bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  or(operator: OperatorType, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  or(operator: OperatorType, secondTerm?: SecondTermType): this & QuerierInterface;
  or(firstTerm: FirstTermType, operator: OperatorType, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  or(firstTerm: FirstTermType, operator: OperatorType, secondTerm?: SecondTermType): this & QuerierInterface;
}

export interface StatementInterface extends QueryInterface, PredicateStatementInterface {
  query: QuerierInterface;
  statement: Array<StatementType<'AND' | 'OR'>>;
}

export interface OrderInterface extends QueryInterface {
  query: QuerierInterface;
  statement: OrderStatementType;

  asc(name: string): this & QuerierInterface;
  desc(name: string): this & QuerierInterface;
}

export interface JoinInterface extends QueryInterface, PredicateStatementInterface {
  query: QuerierInterface;
  statement: Array<JoinStatementType>;

  inner(alias: string, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  inner(name: string, alias?: string): this & QuerierInterface;

  on(): this & QueryInterface
  using(): this & QueryInterface
  where(): this & QueryInterface
}


export interface QuerierInterface {
  from: FromInterface;
  select: SelectInterface;
  where: StatementInterface;
  join: JoinInterface;
  order: OrderInterface;

  getQuery: (options?: QueryArgType) => QueryType;
}

export default {};
