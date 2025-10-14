import type { QuerierOptionsType } from '~/querier/types.ts';
import type { CommonInterface, RawInterface, InsertInterface, TableClauseInterface } from '~/querier/interfaces.ts';
import type { BracketFunction, InsertType } from '~/querier/types.ts';
import Table from '~/querier/services/clauses/table.service.ts';

export class Insert<T extends CommonInterface> implements InsertInterface<T> {
  protected insertTable: TableClauseInterface<T>
  protected insertColumns: Array<InsertType>
  protected returningColumns: Array<string>

  constructor(public querier: T) {
    this.insertColumns = []
    this.returningColumns = []
    this.insertTable = new Table<T>(this.querier, 'INSERT INTO')
  }

  public table(raw: RawInterface<T>): this & T;
  public table(alias: string, bracket: BracketFunction<T>): this & T;
  public table(name: string, alias?: string): this & T;
  public table(name: any, alias?: any): this & T {
    this.insertTable.table(name, alias)
    return this.querier.queue(this)
  }

  public column(name: string, value?: string | number | null): this & T {
    this.insertColumns.push({ name, value: typeof value !== 'undefined' ? value as any : 'DEFAULT' })
    return this.querier.queue(this)
  }

  public returning(name: string): this & T {
    this.returningColumns.push(name)
    return this.querier.queue(this)
  }

  public toInsertQuery(options: QuerierOptionsType): QuerierOptionsType {
    const placeholder = `${options.placeholder ? options.placeholder : ''}`;

    const text = [
      this.insertTable.toTableQuery(options).text,
      `(${this.insertColumns.map((column) => {
        return column.name
      }).join(', ')})`,
      'VALUES',
      `(${this.insertColumns.map((column) => { 
        let text = `'${column.value}'`

        options.args.push(column.value as any);

        if (placeholder) {
          if (options.placeholderType == 'counter') {
            text = `${placeholder}${options.args.length}`;
          } else {
            text = `${placeholder}`;
          }
        }

        return text 
      }).join(', ')})`
    ]
    
    return { 
      ...options, 
      text: text.filter(s => !!s).join(' '), 
      returning: this.returningColumns, 
      columnNames: this.returningColumns 
    }
  }
}

export default Insert;
