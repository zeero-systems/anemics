import { PredicateInterface, QuerierInterface, RawInterface, TableInterface } from '~/querier/interfaces.ts';
import OperatorEnum from './enums/operator.enum.ts';

export type SubQueryType = QuerierInterface
export type RawQueryType = RawInterface
export type BracketFunction<T> = (bracket: SubQueryType) => T;
export type OperatorType = keyof typeof OperatorEnum;
export type BasicTerm = string | number | boolean | Array<string | number | boolean>;
export type FirstTermType = BasicTerm
export type SecondTermType = BasicTerm | SubQueryType | undefined
export type TableKeyType = 'FROM' | 'INNER JOIN' | 'LEFT JOIN' | 'RIGHT JOIN' | 'CROSS JOIN'
export type PredicateKeyType = 'ON' | 'USING' | 'WHERE'
export type JoinKeyType = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL' | 'CROSS'

export type ExpressionType = {
  firstTerm: FirstTermType;
  secondTerm: SecondTermType;
  operator: OperatorEnum;
};

export type PredicateType<P> = {
  type: P
  expression: ExpressionType | SubQueryType | RawQueryType;
};

export type QuerierOptionType = {
  placeholder?: string
  placeholderType?: 'counter' | 'static'
}

export type QueryOptionType = QuerierOptionType & {
  args: Array<string | number>;
  counter: number
}

export type QueryType = QueryOptionType & {
  text: string;
};

export type SelectType = {
  name: string;
  alias?: string | SubQueryType | RawQueryType;
};

export type TableType = {
  name?: string | SubQueryType | RawQueryType;
  alias?: string;
};

export type EventHanderType = 'onTable'

export type QueryEventHanderType = (type: EventHanderType, table: TableType) => void

export type JoinType = {
  table: TableInterface
  join: JoinKeyType
  predicate: PredicateInterface
}

export type OrderType = {
  key: 'ASC' | 'DESC';
  name: string | RawQueryType,
}

export default {};
