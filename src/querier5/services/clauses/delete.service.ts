import type { QuerierOptionsType } from '~/querier/types.ts';
import type { CommonInterface, RawInterface, DeleteInterface, TableClauseInterface } from '~/querier/interfaces.ts';
import type { BracketFunction } from '~/querier/types.ts';
import Table from '~/querier/services/clauses/table.service.ts';

export class Delete<T extends CommonInterface> implements DeleteInterface<T> {
  protected deleteTable: TableClauseInterface<T>
  protected returningColumns: Array<string>

  constructor(public querier: T) {
    this.returningColumns = []
    this.deleteTable = new Table<T>(this.querier, 'DELETE FROM')
  }

  public table(raw: RawInterface<T>): this & T;
  public table(alias: string, bracket: BracketFunction<T>): this & T;
  public table(name: string, alias?: string): this & T;
  public table(name: any, alias?: any): this & T {
    this.deleteTable.table(name, alias)
    return this.querier.queue(this)
  }

  public returning(name: string): this & T {
    this.returningColumns.push(name)
    return this as this & T
  }

  public toDeleteQuery(options: QuerierOptionsType): QuerierOptionsType {
    return {
      ...options,
      text: this.deleteTable.toTableQuery(options).text,
      returning: this.returningColumns,
      columnNames: this.returningColumns
    }
  }
}

export default Delete;
