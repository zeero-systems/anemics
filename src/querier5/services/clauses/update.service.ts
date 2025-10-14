import type { QuerierOptionsType } from '~/querier/types.ts';
import type { CommonInterface, RawInterface, UpdateInterface, TableClauseInterface } from '~/querier/interfaces.ts';
import type { BracketFunction, UpdateType } from '~/querier/types.ts';
import Table from '~/querier/services/clauses/table.service.ts';

export class Update<T extends CommonInterface> implements UpdateInterface<T> {
  protected updateTable: TableClauseInterface<T>
  protected updateColumns: Array<UpdateType>
  protected returningColumns: Array<string>

  constructor(public querier: T) {
    this.updateColumns = []
    this.returningColumns = []
    this.updateTable = new Table<T>(this.querier, 'UPDATE')
  }

  public table(raw: RawInterface<T>): this & T;
  public table(alias: string, bracket: BracketFunction<T>): this & T;
  public table(name: string, alias?: string): this & T;
  public table(name: any, alias?: any): this & T {
    this.updateTable.table(name, alias)
    return this.querier.queue(this)
  }

  public column(name: string, value?: string | number): this & T {
    this.updateColumns.push({ name, value: value || 'DEFAULT' })
    return this as this & T
  }

  public returning(name: string): this & T {
    this.returningColumns.push(name)
    return this as this & T
  }

  public toUpdateQuery(options: QuerierOptionsType): QuerierOptionsType {
    const text = [
      this.updateTable.toTableQuery(options).text,
      `SET ${this.updateColumns.map((column) => {
        return `${column.name} = '${column.value}'`
      }).join(', ')}`
    ]

    return { 
      ...options, 
      text: text.filter(s => !!s).join(' '), 
      returning: this.returningColumns,
      columnNames: this.returningColumns 
    }
  }
}

export default Update;
