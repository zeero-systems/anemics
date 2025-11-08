import type { KeyableType, RequireAtLeastOne } from '@zeero/commons';
import type { OperatorType } from '~/querier/types.ts';
import type { NamingInterface } from '~/persister/interfaces.ts';
import type {
  DeleteClauseInterface,
  IndexQuerierInterface,
  LimitClauseInterface,
  OffsetClauseInterface,
  OrderClauseInterface,
  PredicateClauseInterface,
  QueryQuerierInterface,
  SelectClauseInterface,
  TableClauseInterface,
  TableQuerierInterface,
} from '~/querier/interfaces.ts';

import ForeingActionEnum from '~/querier/enums/foreign-action.enum.ts';
import SchemaAnnotation from '~/persister/annotations/schema.annotation.ts';

export type ColumnType =
  | 'char'
  | 'varchar'
  | 'text'
  | 'tsquery'
  | 'tsvector'
  | 'date'
  | 'interval'
  | 'time'
  | 'timez'
  | 'timestamp'
  | 'timestampz'
  | 'point'
  | 'line'
  | 'lseg'
  | 'box'
  | 'path'
  | 'polygon'
  | 'circle'
  | 'json'
  | 'jsonb'
  | 'jsonpath'
  | 'uuid'
  | 'xml'
  | 'cidr'
  | 'inet'
  | 'macaddr'
  | 'macaddr8'
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
  | 'smallserial'
  | 'daterange'
  | 'tsrange'
  | 'tstzrange'
  | 'bigintrange'
  | 'integerrange'
  | 'numrange'
  | 'boolean'
  | 'bit'
  | 'bytea'
  | 'enum'
  | 'bool'
  | 'varbit'
  | 'foreign';

export type SyntaxType = 'memory' | 'postgresql';

export type CommonOptionsType = {
  name: string;
  naming: NamingInterface;
  attempts?: number;
  pool?: { max: number; lazy: boolean };
  placeholder?: string;
  placeholderType?: 'counter' | 'static';
  syntax: SyntaxType;
};

export type ClientOptionsType = {
  database: string;
  hostname: string;
  password: string;
  port: number;
  schema?: string;
  user: string;
};

export type ExecuteOptionsType = {
  name?: string;
  args?: unknown[] | Record<string, unknown>;
  encoder?: (arg: unknown) => null | string | Uint8Array;
  naming?: (text?: string | number | symbol) => string;
  fields?: string[];
};

export type NoticeType = {
  /** The notice severity level */
  severity: string;
  /** The notice code */
  code: string;
  /** The notice message */
  message: string;
  /** The additional notice detail */
  detail?: string;
  /** The notice hint descrip=bing possible ways to fix this notice */
  hint?: string;
  /** The position of code that triggered the notice */
  position?: string;
  /** The internal position of code that triggered the notice */
  internalPosition?: string;
  /** The internal query that triggered the notice */
  internalQuery?: string;
  /** The where metadata */
  where?: string;
  /** The database schema */
  schema?: string;
  /** The table name */
  table?: string;
  /** The column name */
  column?: string;
  /** The data type name */
  dataType?: string;
  /** The constraint name */
  constraint?: string;
  /** The file name */
  file?: string;
  /** The line number */
  line?: string;
  /** The routine name */
  routine?: string;
};

export type ExecuteResultType<T> = {
  command: 'INSERT' | 'DELETE' | 'UPDATE' | 'SELECT' | 'MOVE' | 'FETCH' | 'COPY' | 'CREATE' | 'NOOP';
  count?: number;
  notices?: NoticeType[];
  columns?: string[];
  rows: T[];
};

export type TransactionIsolationType = 'read_committed' | 'repeatable_read' | 'serializable';

export type TransactionOptionType = {
  isolation?: TransactionIsolationType;
  read_only?: boolean;
  snapshot?: string;
};

export type SchemaOptionsType = {
  name?: string;
  collation?: string;
  naming?: (text?: string | number | symbol) => string;
};

export type ColumnOptionsType = {
  default?: string | number | boolean;
  unique?: boolean;
  nullable?: boolean;
  primaryKey?: boolean;
  collation?: string;
};

export type IndexOptionsType = {
  type: string;
  unique?: boolean;
};

export type JoinKeyType = 'inner' | 'left' | 'right' | 'full' | 'cross';

export type ForeignKeyOptionsType = {
  constraintName?: string;
  foreignKey?: string | string[];
  referenceKey: string | string[];
  onDelete?: `${ForeingActionEnum}`;
  onUpdate?: `${ForeingActionEnum}`;
};

export type FilterExpressionType = {
  [key in OperatorType]?: string | number | boolean | Array<string | number | boolean>;
};

export type FilterPredicateOperatorType = 'and' | 'or';

export type FilterPredicateType = {
  [key in FilterPredicateOperatorType]?: Array<FilterPredicateType | { [key: string | number]: FilterExpressionType }>;
};

export type FilterSelectType = { [key: string]: 'string' | 'number' | 'boolean' | FilterType | boolean };

export type FilterOrderType = { [key: string | number]: 'desc' | 'asc' };

export type FilterType = {
  select?: FilterSelectType | string;
  where?: FilterPredicateType;
  order?: FilterOrderType;
  group?: Array<string>;
  limit?: number;
  offset?: number;
};

export type FilterDictionaryType = {
  delimiter: {
    end: string;
    start: string;
    array: string;
    item: string;
    value: string;
  };
  key: {
    query: string;
    select: string;
    where: string;
    and: string;
    or: string;
    group: string;
    order: string;
    limit: string;
    offset: string;
    entity: string;
  };
  value: {
    ascend: string;
    descend: string;
    number: string;
    string: string;
    boolean: string;
  };
};

export type RelationOptionsType = {
  filter?: FilterType;
  type?: JoinKeyType;
} & RequireAtLeastOne<{ foreignKey: KeyableType; localKey: KeyableType }>;

export type RepositoryOptionsType = {
  encoder?: (arg: unknown) => null | string | Uint8Array;
  toTableNaming: (text?: string | number | symbol) => string;
  toSchemaNaming: (text?: string | number | symbol) => string;
};

export type RepositoryExecuteOptionsType = ExecuteOptionsType & {
  connection?: 'client' | 'transaction';
  transaction?: TransactionOptionType;
};

export type ActionOptionsType = RepositoryExecuteOptionsType & {
  returns?: Array<string>;
};

export type QueryInstanceType = {
  select: SelectClauseInterface<QueryQuerierInterface>;
  delete: DeleteClauseInterface<QueryQuerierInterface>;
  from: TableClauseInterface<QueryQuerierInterface>;
  order: OrderClauseInterface<QueryQuerierInterface>;
  where: PredicateClauseInterface<QueryQuerierInterface>;
  group: SelectClauseInterface<QueryQuerierInterface>;
  limit: LimitClauseInterface<QueryQuerierInterface>;
  returns: SelectClauseInterface<QueryQuerierInterface>;
  offset: OffsetClauseInterface<QueryQuerierInterface>;
};

export type SearchOptionsType = ActionOptionsType & {
  alias: string;
  query: QueryQuerierInterface;
  schema: SchemaAnnotation;
  instance: QueryInstanceType;
};

export type ManyOptionsType = {
  type?: JoinKeyType;
  on?: (predicate: PredicateClauseInterface<QueryQuerierInterface>) => QueryQuerierInterface;
};

export type QuerierType = {
  query: QueryQuerierInterface;
  table: TableQuerierInterface;
  index: IndexQuerierInterface;
};

export default {};
