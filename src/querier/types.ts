export type BuilderOptionsType = {
  grouping?: 'parentheses' | 'brackets' | 'braces'
}

export type QuerierOptionsType = {
  syntax: 'postgreSQL' | 'mySQL'
}

export type IndexerOptionsType = {
  syntax: 'postgreSQL' | 'mySQL'
}

export type ValueType = string;

export type TableType = {
  name?: ValueType;
  alias?: string;
};

export type QueryType = {
  args: Array<string | number>;
  text: string;
  placeholder?: string
  placeholderType?: 'counter' | 'static'
};

export type ClauseType = { name: string; target: any };

export type OperatorType = "eq" | "lt" | "gt" | "like" | "between" | "in" | "not in" | "is null" | "is not null" | "exists"

export type TermType = string | number | boolean | Array<string | number | boolean>;

export type ExpressionType = {
  leftTerm: TermType;
  rightTerm: TermType;
  operator: OperatorType;
};

export type PredicateType = {
  type: 'and' | 'or'
  expression: ExpressionType
};

export type OrderType = {
  key: 'asc' | 'desc';
  column: string,
}

export type QueryFunction<T> = (query: T) => T;

export type DescriptorOptionsType = {
  predicate?: (name: string) => boolean
  properties: PropertyDescriptor
} 

export default {}