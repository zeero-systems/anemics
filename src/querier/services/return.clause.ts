import type { QueryType, AliasColumnType } from '~/querier/types.ts';
import type { BuilderInterface, SelectClauseInterface } from '~/querier/interfaces.ts';

import { Objector, Descriptor } from '@zeero/commons';

@Descriptor({ properties: { enumerable: false } })
export class Return<T extends BuilderInterface<T>> implements SelectClauseInterface<T> {
  public columns: Array<AliasColumnType> = [];

  constructor(
    private _querier: T,
    public key: string = ''
  ) {}

  public hasColumns(): boolean {
    return this.columns.length > 0;
  }

  public column(name: any, alias?: any): this & T {
    this.columns.push({ name, alias });
    return Objector.assign(this._querier, this);
  }

  public query(options: QueryType): QueryType {
    const text: Array<string> = [];

    if (this.key && this.hasColumns()) {
      text.push(this.key);
      text.push(this.columns.map((column) => {
        return [
          column.name,
          column.alias ? ` AS ${column.alias}` : undefined,
        ].join('');
      }).join(', '))
    }

    return {
      ...options,
      args: options.args,
      text: text.filter((s) => !!s).join(' '),
    };
  }
}

export default Return;
