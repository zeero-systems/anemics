import type { BuilderInterface, OffsetClauseInterface } from '~/querier/interfaces.ts';
import type { QueryType } from '~/querier/types.ts';

import { Descriptor, Objector } from '@zeero/commons';

@Descriptor({ properties: { enumerable: false } })
export class Offset<T extends BuilderInterface<T>> implements OffsetClauseInterface<T> {
  private value: number | undefined;

  constructor(
    private _querier: T,
    public key: string = 'OFFSET',
  ) {}

  hasOffset(): boolean {
    return typeof this.value !== 'undefined';
  }

  from(value: number): this & T;
  from(value: any): this & T {
    this.value = value;

    return Objector.assign(this._querier, this);
  }

  public query(options: QueryType): QueryType {
    const text: Array<string> = [];

    if (this.hasOffset()) {
      text.push(this.key);
      text.push(String(this.value));
    }

    return {
      ...options,
      args: options.args,
      text: text.filter((s) => !!s).join(' '),
    };
  }
}

export default Offset;
