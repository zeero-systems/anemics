import type { BuilderInterface, ConstraintClauseInterface, QueryQuerierInterface, RawClauseInterface } from '~/querier/interfaces.ts';

import ForeingActionEnum from '~/querier/enums/foreign-action.enum.ts';
import { SyntaxType } from '../persister/types.ts';

export type BuilderOptionsType = Partial<QueryType> & {
  grouping?: 'parentheses' | 'brackets' | 'braces';
};

export type ValueType = string | QueryQuerierInterface | RawClauseInterface<any>;

export type TableType = {
  name?: ValueType;
  alias?: string;
};

export type AliasColumnType = {
  name: string | RawClauseInterface<any>;
  alias?: ValueType
};

export type ValueColumnType = {
  name?: ValueType;
  value?: string | number | boolean;
};

export type QueryType = {
  args: Array<string | number>;
  text: string;
  returns: Array<string>,
  placeholder?: string;
  placeholderType?: 'counter' | 'static';
};

export type ClauseType = { name: string; target: any };

export type OperatorType =
  | 'eq'
  | 'lt'
  | 'gt'
  | 'like'
  | 'between'
  | 'in'
  | 'not in'
  | 'is null'
  | 'is not null'
  | 'exists';

export type TermType = string | number | boolean | Array<string | number | boolean>;

export type ExpressionType = {
  leftTerm: TermType;
  rightTerm: TermType;
  operator: OperatorType;
};

export type PredicateType = {
  type: 'and' | 'or';
  expression: ExpressionType;
};

export type OrderType = {
  key: 'asc' | 'desc';
  column: string;
};

export type QueryFunction<T extends BuilderInterface<T>> = (query: T) => T;

export type CharacterType = 'char' | 'varchar' | 'text' | 'tsquery' | 'tsvector';
export type DateType = 'date' | 'interval' | 'time' | 'timez' | 'timestamp' | 'timestampz';
export type GeometricType = 'point' | 'line' | 'lseg' | 'box' | 'path' | 'polygon' | 'circle';
export type LanguageType = 'json' | 'jsonb' | 'jsonpath' | 'uuid' | 'xml';
export type NetworkType = 'cidr' | 'inet' | 'macaddr' | 'macaddr8';
export type NumericType =
  | 'bigint'
  | 'bigserial'
  | 'integer'
  | 'decimal'
  | 'double precision'
  | 'money'
  | 'numeric'
  | 'real'
  | 'serial'
  | 'smallint'
  | 'smallserial';
export type RangeType = 'daterange' | 'tsrange' | 'tstzrange' | 'bigintrange' | 'integerrange' | 'numrange';
export type StructureType = 'boolean' | 'bit' | 'bytea' | 'enum' | 'bool' | 'varbit' | 'foreign';

export type ColumnType<T extends BuilderInterface<T>> = {
  type:
    | CharacterType
    | DateType
    | GeometricType
    | LanguageType
    | NetworkType
    | NumericType
    | RangeType
    | StructureType;
  name: string;
  notNull?: boolean;
  collation?: string;
  length?: number;
  scale?: number;
  precision?: number;
  enums?: any[];
  constraints: Array<ConstraintClauseInterface<T>>;
};

export type ConstraintType = {
  name: string;
  default?: string | number | Array<string | number>;
  primaryKey?: Array<string> | boolean;
  check?: string;
  unique?: Array<string> | boolean;
  foreignKey?: Array<string>;
  references?: {
    table: string;
    column: Array<string>;
  };
  onUpdate?: ForeingActionEnum;
  onDelete?: ForeingActionEnum;
};

export type DropType = {
  exists?: boolean;
  cascade?: boolean;
};

export type CreateType = {
  exists?: boolean;
};

export type QuerierOptionsType = {
  syntax: SyntaxType
  placeholder?: string;
  placeholderType?: 'counter' | 'static';
} 

export default {};
