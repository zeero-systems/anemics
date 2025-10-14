import type { QueryFunction, QueryType, TableType } from '~/querier/types.ts';
import type { BuilderInterface, TableClauseInterface } from '~/querier/interfaces.ts';

import Builder from '~/querier/services/builder.services.ts';
import Descriptor from '~/querier/decorations/descriptor.decoration.ts';

import isBuilder from '~/querier/guards/is-builder.guard.ts';
import isQueryFunction from '~/querier/guards/is-query-function.guard.ts';

@Descriptor({ properties: { enumerable: false }})
export class Table<T extends  BuilderInterface<T>> implements TableClauseInterface<T> {
  public tables: Array<TableType> = [];

  constructor(
    private _querier: T,
    public key: string = '',
  ) {}

  public hasTables(): boolean {
    return this.tables.length > 0;
  }

  public table(alias: string, query: QueryFunction<T>): this & T;
  public table(name: string, alias?: string): this & T;
  public table(name: any, alias?: any): this & T {
    const table: TableType = { name,  alias } as any

    if (isQueryFunction(alias)) {
      const toAlias = table.name as string
      table.name = alias(this._querier.instantiate())
      table.alias = toAlias
    }

    this.tables.push(table);
    return Builder.assign(this._querier, this);
  }

  public query(options: QueryType): QueryType {
    const text: Array<string> = [];

    if (this.hasTables()) {
      text.push(this.key);
      text.push(
        this.tables.map((table) => {
          let text: string | undefined = ''

          if (isBuilder(table.name)) {
            table.name?.with({ grouping: 'parentheses' })
            text = [
              `${table.name?.toQuery(options).text}`,
              `AS ${table.alias}`
            ].filter(s => !!s).join(' ')
          }
  
          if (typeof table.name == 'string') {
            text = [
              table.name,
              table.alias ? `AS ${table.alias}` : undefined
            ].filter(s => !!s).join(' ')
          }
  
          return text
        }).join(', '),
      );
    }

    return {
      args: [],
      text: text.filter((s) => !!s).join(' '),
    };
  }
}

export default Table
