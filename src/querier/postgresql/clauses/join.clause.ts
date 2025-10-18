import type {
  BuilderInterface,
  JoinClauseInterface,
  PredicateClauseInterface,
  TableClauseInterface,
} from '~/querier/interfaces.ts';
import type { QueryFunction, QueryType } from '~/querier/types.ts';

import { Objector, Descriptor } from '@zeero/commons';

import Table from '~/querier/postgresql/clauses/table.clause.ts';
import Predicate from '~/querier/postgresql/clauses/predicate.clause.ts';

@Descriptor({ properties: { enumerable: false } })
export class Join<T extends BuilderInterface<T>> implements JoinClauseInterface<T> {
  public on: PredicateClauseInterface<T>;
  public using: PredicateClauseInterface<T>;
  public tabler: TableClauseInterface<T>;

  constructor(
    private _querier: T,
    public key: string = '',
  ) {
    this.on = new Predicate(this._querier, 'ON');
    this.using = new Predicate(this._querier, 'USING');
    this.tabler = new Table(this._querier);
  }

  public hasTables(): boolean {
    return this.tabler.hasTables();
  }

  public table(alias: string, query: QueryFunction<T>): this & T;
  public table(name: string, alias?: string): this & T;
  public table(name: any, alias?: any): this & T {
    this.tabler.table(name, alias);
    return Objector.assign(this._querier, this);
  }

  public query(options: QueryType): QueryType {
    const text: Array<string> = [];

    if (this.hasTables() || this.on.hasPredicates() || this.using.hasPredicates()) {
      text.push(this.key);

      if (this.hasTables()) {
        text.push(this.tabler.query(options).text);
      }

      if (this.on.hasPredicates()) {
        text.push(this.on.query(options).text);
      }

      if (this.using.hasPredicates()) {
        text.push(this.using.query(options).text);
      }
    }

    return {
      ...options,
      args: options.args,
      text: text.filter((s) => !!s).join(' '),
    };
  }
}

export default Join;
