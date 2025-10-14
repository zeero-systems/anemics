
import { BuilderOptionsType, ClauseType, OperatorType, PredicateType, QueryFunction, QueryType, TableType, TermType } from './types.ts';

export interface BuilderInterface<T> {
  with(options: BuilderOptionsType): T
  toQuery(options: QueryType): QueryType;
  instantiate(): T;
}

export interface QuerierInterface<T extends BuilderInterface<T>> extends BuilderInterface<T> {
  get select(): SelectClauseInterface<T>;
  get from(): TableClauseInterface<T>;
  get where(): PredicateClauseInterface<T>;
  get left(): JoinClauseInterface<T>;
  get right(): JoinClauseInterface<T>;
  get inner(): JoinClauseInterface<T>;
  get cross(): JoinClauseInterface<T>;
  get full(): JoinClauseInterface<T>;
  get order(): OrderClauseInterface<T>;
  get raw(): RawClauseInterface<T>;
}

export interface IndexerInterface<T extends BuilderInterface<T>> extends BuilderInterface<T> {
  get create(): NameClauseInterface<T>
  get on(): TableClauseInterface<T>
  get using(): IndexTypeClauseInterface<T>
  get with(): SelectClauseInterface<T>
  get raw(): RawClauseInterface<T>
}

// class t implements QuerierInterface {}

export interface QueryInterface extends QuerierInterface<QueryInterface> {
  clauses: Array<{ previous?: ClauseType; current: ClauseType }>;
  queue(clause: ClauseType): any;
  sorter(clauses: Array<string>): Array<ClauseType>;
}

export interface IndexInterface {
  clauses: Array<{ previous?: ClauseType; current: ClauseType }>;
  queue(clause: ClauseType): any;
  sorter(clauses: Array<string>): Array<ClauseType>;
}

export interface TableInterface {
  // get create(): CreateInterface<QueryInterface>;
}

export interface ClauseInterface {
  query(options: QueryType): QueryType;
}

export interface RawClauseInterface<T> extends ClauseInterface {
  text: string

  value(value: string): this & T;
}
export interface SelectClauseInterface<T> extends ClauseInterface {
  column(name: any, alias?: any): this & T;
}
export interface TableClauseInterface<T extends BuilderInterface<T>> extends ClauseInterface { 
  hasTables(): boolean; 
  table(alias: string, query: QueryFunction<T>): this & T;
  table(name: string, alias?: string): this & T;
}

export interface PredicateClauseInterface<T extends BuilderInterface<T>> extends ClauseInterface {
  predicates: Array<PredicateType>

  hasPredicates(): boolean

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
  name(alias: string, query: QueryFunction<T>): this & T;
  name(value: string, alias?: string): this & T;
}

export interface IndexClauseInterface<T extends BuilderInterface<T>> extends ClauseInterface {
  hasName(): boolean; 
  name(alias: string, query: QueryFunction<T>): this & T;
  name(value: string, alias?: string): this & T;
}

export interface OrderClauseInterface<T> extends ClauseInterface {
  asc(column: string): this & T;
  desc(column: string): this & T;
}
 
export default {};
