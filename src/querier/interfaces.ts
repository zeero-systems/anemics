import ForeingActionEnum from '~/querier/enums/foreign-action.enum.ts';
import {
AliasColumnType,
  BuilderOptionsType,
  CharacterType,
  ClauseType,
  DateType,
  GeometricType,
  LanguageType,
  NetworkType,
  NumericType,
  OperatorType,
  PredicateType,
  QueryFunction,
  QueryType,
  RangeType,
  StructureType,
  TermType,
} from '~/querier/types.ts';

export interface QuerierInterface {
  get query(): QueryQuerierInterface
  get index(): IndexQuerierInterface
  get table(): TableQuerierInterface
}

export interface BuilderInterface<T> {
  use(options: BuilderOptionsType): T;
  toQuery(options?: QueryType): QueryType;
  instantiate(): T;
}

export interface QueryQuerierInterface extends BuilderInterface<QueryQuerierInterface> {
  clauses: Array<{ previous?: ClauseType; current: ClauseType }>;

  get select(): SelectClauseInterface<QueryQuerierInterface>;
  get insert(): InsertClauseInterface<QueryQuerierInterface>;
  get update(): UpdateClauseInterface<QueryQuerierInterface>;
  get delete(): DeleteClauseInterface<QueryQuerierInterface>;
  get from(): TableClauseInterface<QueryQuerierInterface>;
  get where(): PredicateClauseInterface<QueryQuerierInterface>;
  get left(): JoinClauseInterface<QueryQuerierInterface>;
  get right(): JoinClauseInterface<QueryQuerierInterface>;
  get inner(): JoinClauseInterface<QueryQuerierInterface>;
  get cross(): JoinClauseInterface<QueryQuerierInterface>;
  get full(): JoinClauseInterface<QueryQuerierInterface>;
  get order(): OrderClauseInterface<QueryQuerierInterface>;
  get group(): SelectClauseInterface<QueryQuerierInterface>;
  get limit(): LimitClauseInterface<QueryQuerierInterface>;
  get offset(): OffsetClauseInterface<QueryQuerierInterface>;
  get returns(): SelectClauseInterface<QueryQuerierInterface>;
  get raw(): RawClauseInterface<QueryQuerierInterface>;

  queue(clause: ClauseType): any;
}

export interface IndexQuerierInterface extends BuilderInterface<IndexQuerierInterface> {
  clauses: Array<{ previous?: ClauseType; current: ClauseType }>;

  get create(): NameClauseInterface<IndexQuerierInterface>;
  get on(): TableClauseInterface<IndexQuerierInterface>;
  get using(): IndexTypeClauseInterface<IndexQuerierInterface>;
  get with(): SelectClauseInterface<IndexQuerierInterface>;
  get raw(): RawClauseInterface<IndexQuerierInterface>;

  queue(clause: ClauseType): any;
}

export interface TableQuerierInterface extends BuilderInterface<TableQuerierInterface> {
  clauses: Array<{ previous?: ClauseType; current: ClauseType }>;

  get create(): CreateClauseInterface<TableQuerierInterface>;
  get drop(): DropClauseInterface<TableQuerierInterface>;
  get column(): ColumnClauseInterface<TableQuerierInterface>;
  get constraint(): ConstraintClauseInterface<TableQuerierInterface>;
  get returns(): SelectClauseInterface<TableQuerierInterface>;
  get raw(): RawClauseInterface<TableQuerierInterface>;

  queue(clause: ClauseType): any;
}

export interface ClauseInterface {
  query(options: QueryType): QueryType;
}

export interface LimitClauseInterface<T> extends ClauseInterface {
  at(value: number): this & T
}

export interface OffsetClauseInterface<T> extends ClauseInterface {
  from(value: number): this & T
}

export interface RawClauseInterface<T> extends ClauseInterface {
  text: string;

  value(value: string): this & T;
}
export interface SelectClauseInterface<T extends BuilderInterface<T>> extends ClauseInterface {
  columns: Array<AliasColumnType>
  
  hasColumns(): boolean

  column(raw: RawClauseInterface<T>): this & T;
  column(alias: string, raw: RawClauseInterface<T>): this & T;
  column(alias: string, query: QueryFunction<T>): this & T;
  column(name: string, alias?: string): this & T;
  column(name: any, alias?: any): this & T 
}

export interface TableClauseInterface<T extends BuilderInterface<T>> extends ClauseInterface {
  hasTables(): boolean;
  table(alias: string, query: QueryFunction<T>): this & T;
  table(name: string, alias?: string): this & T;
}

export interface PredicateClauseInterface<T extends BuilderInterface<T>> extends ClauseInterface {
  predicates: Array<PredicateType>;

  hasPredicates(): boolean;

  or(raw: RawClauseInterface<T>): this & T;
  or(query: QueryFunction<T>): this & T;
  or(operator: OperatorType, query: QueryFunction<T>): this & T;
  or(operator: OperatorType, rightTerm?: TermType): this & T;
  or(leftTerm: TermType, operator: OperatorType, query: QueryFunction<T>): this & T;
  or(leftTerm: TermType, operator: OperatorType, rightTerm?: TermType): this & T;

  and(raw: RawClauseInterface<T>): this & T;
  and(query: QueryFunction<T>): this & T;
  and(operator: OperatorType, query: QueryFunction<T>): this & T;
  and(operator: OperatorType, rightTerm?: TermType): this & T;
  and(leftTerm: TermType, operator: OperatorType, query: QueryFunction<T>): this & T;
  and(leftTerm: TermType, operator: OperatorType, rightTerm?: TermType): this & T;
}

export interface JoinClauseInterface<T extends BuilderInterface<T>> extends TableClauseInterface<T> {
  on: PredicateClauseInterface<T>;
  using: PredicateClauseInterface<T>;
}

export interface NameClauseInterface<T extends BuilderInterface<T>> extends ClauseInterface {
  hasName(): boolean;
  name(value: string | string[]): this & T;
}

export interface IndexTypeClauseInterface<T extends BuilderInterface<T>> extends ClauseInterface {
  hasType(): boolean;
  type(value: string): this & T;
}

export interface ColumnClauseInterface<T extends BuilderInterface<T>> extends ClauseInterface {
  character(value: CharacterType, options?: { length?: number }): this & T;
  date(value: DateType, options?: { precision?: number }): this & T;
  geometric(value: GeometricType): this & T;
  language(value: LanguageType): this & T;
  name(value: string): this & T;
  network(value: NetworkType): this & T;
  notNull(): this & T;
  numeric(value: NumericType, options?: { scale?: number; precision?: number }): this & T;
  primaryKey(): this & T;
  unique(value?: string | Array<string>): this & T
  default(value: string | number | Array<string | number>): this & T;
  range(value: RangeType): this & T;
  structure(value: StructureType, options?: { enums?: any[] }): this & T;
}

export interface ConstraintClauseInterface<T extends BuilderInterface<T>> extends ClauseInterface {
  check(condition: string): this & T;
  default(column: string | number | Array<string | number>): this & T;
  foreignKey(column: string | Array<string>): this & T;
  name(value: string): this & T;
  onUpdate(action: `${ForeingActionEnum}`): this & T;
  onDelete(action: `${ForeingActionEnum}`): this & T;
  primaryKey(column: string | Array<string> | boolean): this & T;
  references(table: string, options: { column: string | string[] }): this & T;
  unique(column: string | Array<string> | boolean): this & T;
}

export interface OrderClauseInterface<T extends BuilderInterface<T>> extends ClauseInterface {
  asc(column: string): this & T;
  desc(column: string): this & T;
}

export interface DropClauseInterface<T extends BuilderInterface<T>> extends NameClauseInterface<T>, ClauseInterface {
  hasDrop(): boolean;
  exists(): this & T;
  cascade(): this & T;
}

export interface CreateClauseInterface<T extends BuilderInterface<T>> extends NameClauseInterface<T>, ClauseInterface {
  hasCreate(): boolean;
  notExists(): this & T;
}

export interface InsertClauseInterface<T extends BuilderInterface<T>> extends TableClauseInterface<T>, ClauseInterface {
  column(name: string, value?: string | number | boolean): this & T;
}

export interface UpdateClauseInterface<T extends BuilderInterface<T>> extends TableClauseInterface<T>, ClauseInterface {
  column(name: string, value?: string | number): this & T;
}

export interface DeleteClauseInterface<T extends BuilderInterface<T>>
  extends TableClauseInterface<T>, ClauseInterface {}

export default {};
