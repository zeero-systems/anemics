import OperatorEnum from '~/querier/enums/operator.enum.ts';
import { IndexInterface, PredicateInterface, EntryInterface, RawInterface, TableClauseInterface, TableInterface } from '~/querier/interfaces.ts';

export type QuerierOptionsType = {
  args: Array<string | number>
  columnNames?: Array<string>
  placeholder?: string
  placeholderType?: 'counter' | 'static'
  returning?: Array<string>
  steps?: Array<string>
  text: string;
}

export type RawQueryType = RawInterface<any>
export type BracketFunction<T> = (bracket: EntryInterface) => T;
export type OperatorType = `${OperatorEnum}`;
export type BasicTerm = string | number | boolean | Array<string | number | boolean>;
export type FirstTermType = BasicTerm
export type SecondTermType = BasicTerm | EntryInterface | undefined
export type TableKeyType = 'FROM' | 'INNER JOIN' | 'LEFT JOIN' | 'RIGHT JOIN' | 'CROSS JOIN'
export type PredicateKeyType = 'ON' | 'USING' | 'WHERE' | string
export type JoinKeyType = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL' | 'CROSS'

export type ExpressionType = {
  firstTerm: FirstTermType;
  secondTerm: SecondTermType;
  operator: OperatorType;
};

export type PredicateType<P> = {
  type: P
  expression: ExpressionType | EntryInterface | RawQueryType;
};

export type ValueType = string | EntryInterface | RawQueryType;

export type SelectType = {
  name: string | RawQueryType;
  alias?: ValueType
};

export type InsertType = {
  name: string;
  value?: string | number
};

export type UpdateType = {
  name: string;
  value?: string | number
};

export type TableType = {
  name?: ValueType
  alias?: string;
};

export type JoinType = {
  table: TableClauseInterface<any>
  join: JoinKeyType
  predicate: PredicateInterface<any>
}

export type OrderType = {
  key: 'asc' | 'desc';
  name: string | RawQueryType,
}


export type QuerierType = EntryInterface | IndexInterface | TableInterface

export type FilterExpressionType = {
  [key in OperatorEnum]?: string | number | boolean | Array<string | number | boolean>;
}

export type FilterPredicateType = {
  and?: Array<FilterPredicateType | { [key: string | number]: FilterExpressionType }>
  or?: Array<FilterPredicateType | { [key: string | number]: FilterExpressionType }>
}

export type FilterSelectType = { [key: string]: 'string' | 'number' | 'boolean' | FilterType }

export type FilterOrderType = { [key: string | number]: 'desc' | 'asc' }

export type FilterType = {
  select?: FilterSelectType | string,
  where?: FilterPredicateType,
  order?: FilterOrderType
  group?: Array<string>
}

export type FilterDictionaryType = {
  delimiter: {
    end: string
    start: string
    array: string
    item: string
    value: string
  }
  key: {
    query: string
    select: string
    where: string
    and: string
    or: string
    group: string
    order: string
    entity: string
  }
  value: {
    ascend: string
    descend: string
    number: string
    string: string
    boolean: string
  }
}

export default {};
