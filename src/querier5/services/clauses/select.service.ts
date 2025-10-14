import type { QuerierOptionsType } from '~/querier/types.ts';
import type { CommonInterface, RawInterface, SelectInterface } from '~/querier/interfaces.ts';
import type { BracketFunction, SelectType } from '~/querier/types.ts';

import isBracket from '~/querier/guards/is-bracket.guard.ts';
import isQuery from '~/querier/guards/is-querier.guard.ts';
import isRawwer from '~/querier/guards/is-raw.guard.ts';

export class Select<T extends CommonInterface> implements SelectInterface<T> {
  protected selectColumns: Array<SelectType> = []
  
  constructor(
    protected querier: T,
    protected selectKey: string = 'SELECT'
  ) {
  }

  hasSelects(): boolean {
    return this.selectColumns.length > 0
  }

  column(raw: RawInterface<T>): this & T;
  column(alias: string, raw: RawInterface<T>): this & T;
  column(alias: string, bracket: BracketFunction<T>): this & T;
  column(name: string, alias?: string): this & T;
  column(name: any, alias?: any): this & T {

    if (isBracket(alias)) {
      this.selectColumns.push({ name, alias: alias(this.querier.instantiate()) });
    } 
    
    if (alias) {
      this.selectColumns.push({ name, alias });
    } else {
      this.selectColumns.push({ name }); 
    }
    
    return this.querier.queue(this)
  }
  
  toSelectQuery(options: QuerierOptionsType): QuerierOptionsType {

    let text = ''
    const columnNames: Array<string> = []
    
    if (this.hasSelects()) {
      text = [
        this.selectKey,
        this.selectColumns.map((column) => {
          
          if (isQuery(column.alias)) {
            const q = column.alias.toQuery(options)
            return `(${q.text}) AS ${column.name}`
          } 

          if (isRawwer(column.alias)) {
            columnNames.push(column.name as string)
            return `${column.alias.toRawQuery(options).text} AS ${column.name}`
          }
          
          if (isRawwer(column.name)) {
            return column.name.toRawQuery(options).text
          }

          columnNames.push(column.alias as string || column.name)

          return [
            column.name,
            column.alias ? ` AS ${column.alias}` : undefined,
          ].join('')
          
        }).join(', '),
      ].filter((s) => !!s).join(' ');
    }

    return { ...options, text, columnNames };
  }
}

export default Select;
