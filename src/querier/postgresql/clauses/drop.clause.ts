import type { DropType, QueryType } from '~/querier/types.ts';
import type { BuilderInterface, DropClauseInterface, NameClauseInterface } from '~/querier/interfaces.ts';

import { Objector, Descriptor } from '@zeero/commons';

import Name from '~/querier/postgresql/clauses/name.clause.ts';

@Descriptor({ properties: { enumerable: false } })
export class Drop<T extends BuilderInterface<T>> implements DropClauseInterface<T> {
  public drops: DropType = {} as DropType;
  public namer: NameClauseInterface<T>;

  constructor(
    private _querier: T,
    public key: string = '',
  ) {
    this.namer = new Name(this._querier);
  }

  public hasName(): boolean {
    return !!this.namer.hasName();
  }

  public hasDrop(): boolean {
    return !!this.namer.hasName();
  }

  public name(value: string): this & T {
    this.namer.name(value);
    return Objector.assign(this._querier, this);
  }

  public exists(): this & T {
    this.drops.exists = true;
    return Objector.assign(this._querier, this);
  }

  public cascade(): this & T {
    this.drops.cascade = true;
    return Objector.assign(this._querier, this);
  }

  public query(options: QueryType): QueryType {
    const text: Array<string> = [];

    if (this.hasDrop()) {
      text.push(this.key);

      if (this.drops.exists) {
        text.push(`IF EXISTS`);
      }

      text.push(this.namer.query(options).text);

      if (this.drops.cascade) {
        text.push(`CASCADE`);
      } else {
        text.push(`RESTRICT`);
      }
    }

    return {
      ...options,
      args: options.args,
      text: text.filter((s) => !!s).join(' '),
    };
  }
}

export default Drop;
