import { QuerierInterface, StatementInterface } from '~/querier/interfaces.ts';
import OperatorEnum from './enums/operator.enum.ts';

export type SubQueryType = QuerierInterface
 
export type BracketFunction<T> = (bracket: SubQueryType) => T;

export type OperatorType = keyof typeof OperatorEnum;

export type BasicTerm = string | number | boolean | Array<string | number | boolean>;

export type FirstTermType = BasicTerm
export type SecondTermType = BasicTerm | SubQueryType | undefined

export type ExpressionType = {
  firstTerm: FirstTermType;
  secondTerm: SecondTermType;
  operator: OperatorEnum;
};

export type StatementType<P> = {
  predicate: P
  expression: ExpressionType | SubQueryType;
};

export type QuerierOptionType = {
  placeholder?: string
  placeholderType?: 'counter' | 'static'
}

export type QueryArgType = QuerierOptionType & {
  args: Array<string | number>;
  counter: number
}

export type QueryType = QueryArgType & {
  text: string;
};

export type FieldType = {
  name: string;
  alias?: string | QuerierInterface;
};

export type TableType = {
  name?: string | SubQueryType;
  alias?: string;
};

export type SelectStatementType = {
  distinct?: boolean;
  columns: Array<FieldType>;
};

export type FromStatementType = TableType;

export type JoinStatementType = {
  table: TableType
  type?: 'OUTER' | 'ANY' | 'ALL'
  operator: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL' | 'CROSS'
  predicate: JoinPredicateType
  statements: StatementInterface
}

export type JoinPredicateType = 'ON' | 'USING' | 'WHERE'

export type OrderType = {
  key: 'ASC' | 'DESC';
  name: string,
}

export type OrderStatementType = {
  columns: Array<OrderType>;
};

export default {};
