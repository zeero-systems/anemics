import type { AnnotationInterface, NewableType } from '@zeero/commons';
import type { FilterType } from '~/querier/types.ts';
import type {
  CharacterOptionsType,
  CharacterType,
  ClientOptionsType,
  CommonOptionsType,
  DateOptionsType,
  DateType,
  ExecuteOptionsType,
  ExecuteResultType,
  JoinKeyType,
  GeometricOptionsType,
  GeometricType,
  IndexOptionsType,
  LanguageOptionsType,
  LanguageType,
  NetworkOptionsType,
  NetworkType,
  NumericOptionsType,
  NumericType,
  RangeOptionsType,
  RangeType,
  ForeignKeyOptionsType,
  RelationOptionsType,
  SchemaOptionsType,
  StructureOptionsType,
  StructureType,
  TransactionOptionType,
} from '~/storer/types.ts';


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

export interface TransactionInterface {
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

export interface ConnectionInterface {
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

// @TODO make a better option|type assertion
export interface ColumnInterface {
  name: string;
  options?:
    & CharacterOptionsType
    & StructureOptionsType
    & DateOptionsType
    & GeometricOptionsType
    & LanguageOptionsType
    & NetworkOptionsType
    & NumericOptionsType
    & RangeOptionsType;
  type: CharacterType | DateType | GeometricType | LanguageType | NetworkType | NumericType | RangeType | StructureType;
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
  relations: { key: string | symbol; annotation:  RelationInterface & AnnotationInterface }[];
  table: string;
}

export interface RelationInterface {
  referenceTable: () => NewableType<any>
  options?: RelationOptionsType
}

export default {};
