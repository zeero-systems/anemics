import type { QuerierOptionsType } from '~/querier/types.ts';
import type { BracketFunction, TableType, TableKeyType } from '~/querier/types.ts';
import type { TableClauseInterface, RawInterface, CommonInterface } from '~/querier/interfaces.ts';

import isBracket from '~/querier/guards/is-bracket.guard.ts';
import isQuerier from '~/querier/guards/is-querier.guard.ts';
import isRawwer from '~/querier/guards/is-raw.guard.ts';

export class Table<T extends CommonInterface> implements TableClauseInterface<T> {
  
  protected tables: Array<TableType> = []
  
  constructor(
    protected querier: T,
    protected tableKey?: TableKeyType | any
  ) {
    
  }

  hasTables(): boolean {
    return this.tables.length > 0
  }

  table(raw: RawInterface<T>): void;
  table(alias: string, bracket: BracketFunction<T>): void;
  table(name: string, alias?: string): void;
  table(name: any, alias?: any): void {
    const table: TableType = { name,  alias } as any

    if (isBracket(alias)) {
      const toAlias = table.name as string
      table.name = alias(this.querier.instantiate())
      table.alias = toAlias
    }

    this.tables.push(table);
  }

  toTableQuery(options: QuerierOptionsType): QuerierOptionsType {

    let text = ''
    
    if (this.hasTables()) {
      text = [
        this.tableKey,
        this.tables.map((table) => {
          let text: string | undefined = ''

          if (isQuerier(table.name)) {
            text = [
              `(${table.name?.toQuery(options).text})`,
              `AS ${table.alias}`
            ].filter(s => !!s).join(' ')
          }
  
          if (isRawwer(table.name)) { 
            text = table.name.toRawQuery(options).text
          }
  
          if (typeof table.name == 'string') {
            text = [
              table.name,
              table.alias ? `AS ${table.alias}` : undefined
            ].filter(s => !!s).join(' ')
          }
  
          return text
        }).join(', '),
      ].filter((s) => !!s).join(' ');
    }

    return { ...options, text }
  }
  
}

export default Table