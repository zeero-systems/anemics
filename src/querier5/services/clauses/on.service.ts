import { CommonInterface, OnInterface, TableClauseInterface, RawInterface } from '~/querier/interfaces.ts';
import { BracketFunction, QuerierOptionsType } from '~/querier/types.ts';
import Table from '~/querier/services/clauses/table.service.ts';

export class On<T extends CommonInterface> implements OnInterface<T> {
  protected fromTable: TableClauseInterface<T>

  constructor(public querier: T) {
    this.fromTable = new Table<T>(this.querier, 'ON')
  }

  public table(raw: RawInterface<T>): this & T;
  public table(alias: string, bracket: BracketFunction<T>): this & T;
  public table(name: string, alias?: string): this & T;
  public table(name: any, alias?: any): this & T {
    this.fromTable.table(name, alias)
    return this.querier.queue(this)
  }

  public toOnQuery(options: QuerierOptionsType): QuerierOptionsType {
    return this.fromTable.toTableQuery(options)
  }
}

export default On
