import {
BracketFunction,
  FirstTermType,
  OperatorType,
  QuerierOptionsType,
  SecondTermType,
  FilterDictionaryType,
  FilterType,
  ValueType,
} from '~/querier/types.ts';
import NumericEnum from '~/storer/enums/numeric.enum.ts';
import CharacterEnum from '~/storer/enums/character.enum.ts';
import StructureEnum from '~/storer/enums/structure.enum.ts';
import DateEnum from '~/storer/enums/date.enum.ts';
import GeometricEnum from '~/storer/enums/geometric.enum.ts';
import LanguageEnum from '~/storer/enums/language.enum.ts';
import NetworkEnum from '~/storer/enums/network.enum.ts';
import RangeEnum from '~/storer/enums/range.enum.ts';
import ForeingActionEnum from './enums/foreign-action.enum.ts';

export interface ClauseInterface {
  [key: string]: any;
}

export interface NameInterface<T extends CommonInterface> extends ClauseInterface {
  hasName(): boolean

  name(name: ValueType): this & T;
}

export interface ExistsInterface <T extends CommonInterface> extends ClauseInterface {
  hasExists(): boolean

  exists(raw: RawInterface<T>): this & T;
  exists(value: boolean): this & T;
  exists(value: any): this & T;
}

export interface ActionInterface <T extends CommonInterface, K> extends ClauseInterface {
  hasAction(): boolean

  action(raw: RawInterface<T>): this & T;
  action(value: K): this & T;
  action(value: any): this & T;
}

export interface TableClauseInterface<T extends CommonInterface> extends ClauseInterface {
  table(raw: RawInterface<T>): void;
  table(alias: string, bracket: BracketFunction<T>): void;
  table(name: string, alias?: string): void;
}

export interface FromInterface<T extends CommonInterface> extends ClauseInterface {
  table(raw: RawInterface<T>): this & T;
  table(alias: string, bracket: BracketFunction<T>): this & T;
  table(name: string, alias?: string): this & T;
}

export interface OnInterface<T extends CommonInterface> extends ClauseInterface {
  table(raw: RawInterface<T>): this & T;
  table(alias: string, bracket: BracketFunction<T>): this & T;
  table(name: string, alias?: string): this & T;
}

export interface SelectInterface<T extends CommonInterface> extends ClauseInterface {
  column(raw: RawInterface<T>): this & T;
  column(alias: string, raw: RawInterface<T>): this & T;
  column(alias: string, bracket: BracketFunction<T>): this & T;
  column(name: string, alias?: string): this & T;
}

export interface InsertInterface<T extends CommonInterface> extends ClauseInterface {
  table(raw: RawInterface<T>): this & T;
  table(alias: string, bracket: BracketFunction<T>): this & T;
  table(name: string, alias?: string): this & T;

  column(name: string, value?: string | number | null): this & T
  returning(name: string): this & T 
}

export interface UpdateInterface<T extends CommonInterface> extends ClauseInterface {
  table(raw: RawInterface<T>): this & T;
  table(alias: string, bracket: BracketFunction<T>): this & T;
  table(name: string, alias?: string): this & T;

  column(name: string, value?: string | number): this & T
  returning(name: string): this & T 
}

export interface DeleteInterface<T extends CommonInterface> extends ClauseInterface {
  table(raw: RawInterface<T>): this & T;
  table(alias: string, bracket: BracketFunction<T>): this & T;
  table(table: string, alias?: string): this & T;

  returning(name: string): this & T 
}

export interface WhereInterface<T extends CommonInterface> extends ClauseInterface {
  and(raw: RawInterface<T>): this & T;
  and(bracket: BracketFunction<T>): this & T;
  and(operator: OperatorType, bracket: BracketFunction<T>): this & T;
  and(operator: OperatorType, secondTerm?: SecondTermType): this & T;
  and(
    firstTerm: FirstTermType,
    operator: OperatorType,
    bracket: BracketFunction<T>,
  ): this & T;
  and(firstTerm: FirstTermType, operator: OperatorType, secondTerm?: SecondTermType): this & T;

  or(raw: RawInterface<T>): this & T;
  or(bracket: BracketFunction<T>): this & T;
  or(operator: OperatorType, bracket: BracketFunction<T>): this & T;
  or(operator: OperatorType, secondTerm?: SecondTermType): this & T;
  or(firstTerm: FirstTermType, operator: OperatorType, bracket: BracketFunction<T>): this & T;
  or(firstTerm: FirstTermType, operator: OperatorType, secondTerm?: SecondTermType): this & T;
}

export interface JoinInterface<T extends CommonInterface = any> extends ClauseInterface {
  on: PredicateInterface<T>;
  using: PredicateInterface<T>;
  
  table(raw: RawInterface<T>): this & T;
  table(alias: string, bracket: BracketFunction<T>): this & T;
  table(name: string, alias?: string): this & T;
}

export interface PredicateInterface<T extends CommonInterface = any> extends ClauseInterface {
  and(raw: RawInterface<T>): this & T;
  and(bracket: BracketFunction<T>): this & T;
  and(operator: OperatorType, bracket: BracketFunction<T>): this & T;
  and(operator: OperatorType, secondTerm?: SecondTermType): this & T;
  and(
    firstTerm: FirstTermType,
    operator: OperatorType,
    bracket: BracketFunction<T>,
  ): this & T;
  and(firstTerm: FirstTermType, operator: OperatorType, secondTerm?: SecondTermType): this & T;

  or(raw: RawInterface<T>): this & T;
  or(bracket: BracketFunction<T>): this & T;
  or(operator: OperatorType, bracket: BracketFunction<T>): this & T;
  or(operator: OperatorType, secondTerm?: SecondTermType): this & T;
  or(firstTerm: FirstTermType, operator: OperatorType, bracket: BracketFunction<T>): this & T;
  or(firstTerm: FirstTermType, operator: OperatorType, secondTerm?: SecondTermType): this & T;
}

export interface OrderInterface<T extends CommonInterface> extends ClauseInterface {
  asc(raw: RawInterface<T>): this & T;
  asc(name: string): this & T;

  desc(raw: RawInterface<T>): this & T;
  desc(name: string): this & T;
}

export interface GroupInterface<T extends CommonInterface> extends ClauseInterface {
  column(raw: RawInterface<T>): this & T;
  column(name: string): this & T;
}

export interface TypeInterface<T extends CommonInterface> extends ClauseInterface {
  type(raw: RawInterface<T>): T;
  type(type: string): T;
}

export interface IndexOnInterface<T extends CommonInterface> extends ClauseInterface {
  table(raw: RawInterface<T>): this & T;
  table(alias: string, bracket: BracketFunction<T>): this & T;
  table(name: string, alias?: string): this & T;
}

export interface RawInterface<T extends CommonInterface> extends ClauseInterface {}

export interface RawwerInterface<T extends CommonInterface> extends ClauseInterface {
  text: (value: string) => this & T
}

export interface ColumnInterface<T extends CommonInterface> extends ClauseInterface {
  name(name: string | string[]): this & T
  
  character(type: `${CharacterEnum}`, options?: { length?: number }): this & T;
  structure(type: `${StructureEnum}`, options?: { enums?: any[] }): this & T;
  date(type: `${DateEnum}`, options?: { precision?: number }): this & T;
  geometric(type: `${GeometricEnum}`): this & T;
  language(type: `${LanguageEnum}`): this & T;
  network(type: `${NetworkEnum}`): this & T;
  numeric(type: `${NumericEnum}`, options?: { precision?: number; scale?: number }): this & T;
  range(type: `${RangeEnum}`): this & T;

  primary(): this & T;
  unique(): this & T;
  nullable(value: boolean): this & T;
  default(value: string | number): this & T;
  collation(value: string): this & T;
}

export interface ConstraintInterface<T extends CommonInterface> extends ClauseInterface {
  name(name: string | string[]): this & T
  foreingKey(name: string | string[]): this & T
  onUpdate(action: `${ForeingActionEnum}`): this & T
  onDelete(action: `${ForeingActionEnum}`): this & T

  references(table: string, options: { field: string | string[] }): this & T
}

export interface CommonInterface extends ClauseInterface {
  instantiate(): any
  toQuery: (options?: QuerierOptionsType) => QuerierOptionsType;
}

export interface EntryInterface extends CommonInterface {
  from: FromInterface<EntryInterface>
  insert: InsertInterface<EntryInterface>
  update: UpdateInterface<EntryInterface>
  delete: DeleteInterface<EntryInterface>
  select: SelectInterface<EntryInterface>
  where: WhereInterface<EntryInterface>
  full: JoinInterface<EntryInterface>
  cross: JoinInterface<EntryInterface>
  left: JoinInterface<EntryInterface>
  right: JoinInterface<EntryInterface>
  inner: JoinInterface<EntryInterface>
  order: OrderInterface<EntryInterface>
  group: GroupInterface<EntryInterface>
  raw: RawwerInterface<EntryInterface>

  clauses: Array<ClauseInterface>

  toQuery: (options?: QuerierOptionsType) => QuerierOptionsType;
}

export interface IndexInterface extends CommonInterface {
  create: NameInterface<IndexInterface>
  update: NameInterface<IndexInterface>
  on: OnInterface<IndexInterface>
  using: TypeInterface<IndexInterface>
  with: SelectInterface<IndexInterface>
  raw: RawwerInterface<IndexInterface>
}

export interface TableInterface extends CommonInterface {
  create: NameInterface<TableInterface>
  drop: NameInterface<TableInterface>
  column: ColumnInterface<TableInterface>
  constraint: ConstraintInterface<TableInterface>
  raw: RawwerInterface<TableInterface>;

  clauses: Array<ClauseInterface>;

  ifNotExists(raw: RawInterface<TableInterface>): TableInterface;
  ifNotExists(value?: any): TableInterface

  ifExists(raw: RawInterface<TableInterface>): TableInterface;
  ifExists(value?: any): TableInterface

  cascade(): TableInterface
  restrict(): TableInterface

  toQuery: (options?: QuerierOptionsType) => QuerierOptionsType;
}

export interface QuerierInterface {
  options: Partial<QuerierOptionsType> & Pick<QuerierOptionsType, 'text' | 'placeholder' | 'placeholderType'>

  entry: EntryInterface
  index: IndexInterface
  table: TableInterface
}

export interface FilterInterface {
  dictionary: FilterDictionaryType

  toFilter(text: string): FilterType
  toString(search: FilterType): string 
}

export default {};
