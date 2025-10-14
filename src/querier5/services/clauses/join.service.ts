import type { JoinInterface, RawInterface, PredicateInterface, TableClauseInterface, CommonInterface } from '~/querier/interfaces.ts';
import type { BracketFunction, JoinKeyType } from '~/querier/types.ts';
import type { QuerierOptionsType } from '~/querier/types.ts';

import Predicate from '~/querier/services/clauses/predicate.service.ts';
import Table from '~/querier/services/clauses/table.service.ts';
import assign from '~/querier/functions/assign.function.ts';

export class Join<T extends CommonInterface> implements JoinInterface<T> {
  
  public on: PredicateInterface<T>;
  public using: PredicateInterface<T>;

  protected fromJoin: TableClauseInterface<T>;
  
  constructor(
    public querier: T,
    protected joinKey: JoinKeyType = 'INNER'
  ) {
    this.fromJoin = new Table<T>(this.querier)
    this.on = assign(new Predicate<T>(this.querier, 'ON'), this)
    this.using = assign(new Predicate<T>(this.querier, 'USING'), this)
  }

  table(raw: RawInterface<T>): this & T;
  table(alias: string, bracket: BracketFunction<T>): this & T;
  table(name: string, alias?: string): this & T;
  table(name: any, alias?: any): this & T {
    this.fromJoin.table(name, alias)
    return this.querier.queue(this)
  }

  toJoinQuery(options: QuerierOptionsType): QuerierOptionsType {
    return {
      ...options,
      text: [
        this.joinKey,
        'JOIN',
        this.fromJoin.toTableQuery(options).text,
        this.on.toPredicateQuery(options).text,
        this.using.toPredicateQuery(options).text,
      ].filter(s => !!s).join(' ')
    }
  }
}

export default Join
