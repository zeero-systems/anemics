import type { KeyableType } from '@zeero/commons';
import type { FilterType } from '~/querier/types.ts';
import type { NamingInterface } from '~/storer/interfaces.ts';

import IndexEnum from '~/storer/enums/index.enum.ts';
import CharacterEnum from '~/storer/enums/character.enum.ts';
import StructureEnum from '~/storer/enums/structure.enum.ts';
import DateEnum from '~/storer/enums/date.enum.ts';
import GeometricEnum from '~/storer/enums/geometric.enum.ts';
import LanguageEnum from '~/storer/enums/language.enum.ts';
import NetworkEnum from '~/storer/enums/network.enum.ts';
import NumericEnum from '~/storer/enums/numeric.enum.ts';
import RangeEnum from './enums/range.enum.ts';

import ForeingActionEnum from '~/querier/enums/foreign-action.enum.ts';

export type CommonOptionsType = {
  name: string;
  naming: NamingInterface;
  attempts?: number;
  pool?: { max: number; lazy: boolean };
  placeholder?: string
  placeholderType?: 'counter' | 'static'
};

export type ClientOptionsType = {
  database: string;
  hostname: string;
  password: string;
  port: number;
  schema: string;
  user: string;
};

export type ExecuteOptionsType = {
  name?: string;
  args?: unknown[] | Record<string, unknown>;
  encoder?: (arg: unknown) => null | string | Uint8Array;
  naming?: (text?: string | number | symbol) => string
  fields?: string[];
}


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
}

export type ExecuteResultType<T> = {
  command: "INSERT" | "DELETE" | "UPDATE" | "SELECT" | "MOVE" | "FETCH" | "COPY" | "CREATE" | "NOOP",
  count?: number,
  notices?: NoticeType[],
  columns?: string[],
  rows: T[]
}

export type TransactionIsolationType = 'read_committed' | 'repeatable_read' | 'serializable';

export type TransactionOptionType = {
  isolation?: TransactionIsolationType;
  read_only?: boolean;
  snapshot?: string;
};

export type SchemaOptionsType = {
  name?: string
  collation?: string
  naming?: (text?: string | number | symbol) => string
}

export type CharacterType = Lowercase<`${CharacterEnum}`>
export type StructureType = Lowercase<`${StructureEnum}`>
export type DateType = Lowercase<`${DateEnum}`>
export type GeometricType = Lowercase<`${GeometricEnum}`>
export type LanguageType = Lowercase<`${LanguageEnum}`>
export type NetworkType = Lowercase<`${NetworkEnum}`>
export type NumericType = Lowercase<`${NumericEnum}`>
export type RangeType = Lowercase<`${RangeEnum}`>

export type ColumnOptionsType = {
  default?: string | number
  unique?: boolean
  nullable?: boolean
  primary?: boolean
  collation?: string
}

export type CharacterOptionsType = ColumnOptionsType & {
  length?: number
}

export type StructureOptionsType = ColumnOptionsType & {
  enums?: any[],
}

export type DateOptionsType = ColumnOptionsType & {
  precision?: number
}

export type GeometricOptionsType = ColumnOptionsType

export type LanguageOptionsType = ColumnOptionsType

export type NetworkOptionsType = ColumnOptionsType

export type NumericOptionsType = ColumnOptionsType & {
  scale?: number
  precision?: number
}

export type RangeOptionsType = ColumnOptionsType

export type IndexType = `${IndexEnum}`

export type IndexOptionsType = {
  type: IndexType
  unique?: boolean
}

export type JoinKeyType = 'inner' | 'left' | 'right' | 'full' | 'cross'

export type ForeignKeyOptionsType = {
  constraintName?: string
  foreignKey?: string | string[]
  referenceKey: string | string[]
  onDelete?: `${ForeingActionEnum}`
  onUpdate?: `${ForeingActionEnum}`
}

// @TODO move this type to commons
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & {
  [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
}[Keys];

export type RelationOptionsType = {
  filter?: FilterType
  type?: JoinKeyType
} & RequireAtLeastOne<{ foreignKey: KeyableType, localKey: KeyableType }>

export default {};
