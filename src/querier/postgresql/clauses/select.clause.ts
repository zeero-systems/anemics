import type { QueryType, TableType } from '~/querier/types.ts';
import type { SelectClauseInterface } from '~/querier/interfaces.ts';

import Builder from '~/querier/services/builder.services.ts';
import Descriptor from '~/querier/decorations/descriptor.decoration.ts';

@Descriptor({ properties: { enumerable: false }})
export class Select<T> implements SelectClauseInterface<T> {
  public columns: Array<TableType> = [];

  constructor(
    private _querier: T,
    private key: 'SELECT',
  ) {}

  public hasColumns(): boolean {
    return this.columns.length > 0;
  }

  public column(name: any, alias?: any): this & T {
    this.columns.push({ name, alias });
    return Builder.assign(this._querier, this);
  }

  public query(options: QueryType): QueryType {
    const text: Array<string> = [];

    if (this.hasColumns()) {
      text.push(this.key);
      text.push(
        this.columns.map((column) => {
          return [
            column.name,
            column.alias ? ` AS ${column.alias}` : undefined,
          ].join('');
        }).join(', '),
      );
    }

    return {
      args: [],
      text: text.filter((s) => !!s).join(' '),
    };
  }
}

export default Select
