import type { AnnotationInterface, NewableType } from '@zeero/commons';
import type {
  ActionOptionsType,
  ClientOptionsType,
  ColumnOptionsType,
  ColumnType,
  CommonOptionsType,
  ExecuteOptionsType,
  ExecuteResultType,
  FilterDictionaryType,
  FilterPredicateType,
  FilterType,
  ForeignKeyOptionsType,
  IndexOptionsType,
  RelationOptionsType,
  RepositoryOptionsType,
  SchemaOptionsType,
  SearchOptionsType,
  TransactionOptionType,
} from '~/persister/types.ts';

import type { QueryType } from '~/querier/types.ts';
import type { QuerierInterface } from '~/querier/interfaces.ts';

export interface PersisterInterface {
  common: CommonOptionsType;
  options: ClientOptionsType;
  extra?: any;

  instantiate(): DatabaseInterface;
}

export interface NamingInterface {
  getTableName(name: string): string;
  getColumnName(name: string): string;
  getForeignKeyName(name: string, relatedName: string): string;
  getForeignKeyName(name: string): string;
}

export interface DatabaseInterface {
  extra?: any;
  common: CommonOptionsType;
  options: ClientOptionsType;

  connection(): Promise<ConnectionInterface>;
}

export interface TransactionInterface extends AsyncDisposable {
  client: any;
  options: {
    name: string;
    transaction: TransactionOptionType;
  };

  begin(): Promise<void>;
  commit(): Promise<void>;
  release(): Promise<void>;
  execute<T>(query: string, options?: ExecuteOptionsType): Promise<ExecuteResultType<T>>;
  rollback(): Promise<void>;
}

export interface ConnectionInterface extends AsyncDisposable {
  client: any;
  connected?: boolean;

  connect(): Promise<void>;
  disconnect(): Promise<void>;
  transaction(name: string, options?: TransactionOptionType): TransactionInterface;
  execute<T>(query: string, options?: ExecuteOptionsType): Promise<ExecuteResultType<T>>;
}

export interface IndexInterface {
  indexName?: string | string[];
  options?: IndexOptionsType;
}

export interface ColumnInterface {
  name: string;
  options?: ColumnOptionsType & { length?: number; scale?: number; precision?: number; enums?: any[] };
  type: ColumnType;
}

export interface ForeignKeyInterface {
  referenceTable: string | NewableType<any>;
  options: ForeignKeyOptionsType;
}

export interface SchemaInterface {
  columns: { key: string | symbol; annotation: ColumnInterface & AnnotationInterface }[];
  foreignKeys: { key: string | symbol; annotation: ForeignKeyInterface & AnnotationInterface }[];
  indexes: { key: string | symbol; annotation: IndexInterface & AnnotationInterface }[];
  options?: SchemaOptionsType;
  relations: { key: string | symbol; annotation: RelationInterface & AnnotationInterface }[];
  table: string;
}

export interface FilterInterface {
  dictionary: FilterDictionaryType;

  toFilter(text: string): FilterType;
  toString(search: FilterType): string;
}

export interface RelationInterface {
  referenceTable: () => NewableType<any>;
  options?: RelationOptionsType;
}

import SchemaAnnotation from '~/persister/annotations/schema.annotation.ts';

export interface RepositoryInterface<T extends NewableType<T>> {
  types: string[];

  query: RepositoryQueryInterface<T>;
  table: RepositoryTableInterface<T>;

  schema: T;
  querier: QuerierInterface;
  database: DatabaseInterface;
  options: RepositoryOptionsType;
  annotation: SchemaAnnotation;

  execute(queries: QueryType[], options?: ExecuteOptionsType): Promise<Array<ExecuteResultType<InstanceType<T>>>>;
  executeWithConnect(
    queriers: QueryType[],
    options?: ExecuteOptionsType,
  ): Promise<ExecuteResultType<InstanceType<T>>[]>;
  executeWithTransaction(
    queriers: QueryType[],
    options?: ExecuteOptionsType,
  ): Promise<ExecuteResultType<InstanceType<T>>[]>;
}

export interface RepositoryTableInterface<T extends NewableType<T>> {
  create(): Promise<InstanceType<T>>;
  createQuery(): Array<QueryType>;
  createExecute(): Promise<Array<ExecuteResultType<InstanceType<T>>>>;

  drop(action?: 'cascade' | 'restrict'): Promise<boolean>;
  dropQuery(action?: 'cascade' | 'restrict'): Array<QueryType>;
  dropExecute(action?: 'cascade' | 'restrict'): Promise<Array<ExecuteResultType<InstanceType<T>>>>;
}

export interface RepositoryQueryInterface<T extends NewableType<T>> {
  create(record: InstanceType<T>, options?: ActionOptionsType): Promise<InstanceType<T>>;
  createMany(records: Array<InstanceType<T>>, options?: ActionOptionsType): Promise<Array<InstanceType<T>>>;
  createQuery(records: Array<InstanceType<T>>, options?: ActionOptionsType): Array<QueryType>;
  createExecute(
    records: Array<InstanceType<T>>,
    options?: ActionOptionsType,
  ): Promise<Array<ExecuteResultType<InstanceType<T>>>>;

  update(record: Partial<InstanceType<T>>, options?: ActionOptionsType): Promise<InstanceType<T>>;
  updateMany(
    records: Array<Partial<InstanceType<T>>>,
    options?: ActionOptionsType,
  ): Promise<Array<Partial<InstanceType<T>>>>;
  updateQuery(records: Array<Partial<InstanceType<T>>>, options?: ActionOptionsType): Array<QueryType>;
  updateExecute(
    records: Array<Partial<InstanceType<T>>>,
    options?: ActionOptionsType,
  ): Promise<Array<ExecuteResultType<InstanceType<T>>>>;

  delete(query: FilterPredicateType | InstanceType<T>, returning?: ActionOptionsType): Promise<InstanceType<T>>;
  deleteMany(
    queries: Array<FilterPredicateType | InstanceType<T>>,
    returning?: ActionOptionsType,
  ): Promise<Array<InstanceType<T>>>;
  deleteQuery(where: FilterPredicateType, returning?: ActionOptionsType): QueryType;
  deleteExecute(
    where: FilterPredicateType,
    returning?: ActionOptionsType,
  ): Promise<Array<ExecuteResultType<InstanceType<T>>>>;

  search(search: FilterType, options?: SearchOptionsType): Promise<Array<InstanceType<T>>>;
  searchFirst(search: FilterType, options?: SearchOptionsType): Promise<InstanceType<T>>;
  searchQuery(search: FilterType, options?: SearchOptionsType): QueryType;
  searchExecute(search: FilterType, options?: SearchOptionsType): Promise<Array<ExecuteResultType<InstanceType<T>>>>;
}

export default {};
