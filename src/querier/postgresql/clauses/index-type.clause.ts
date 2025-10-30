import type { QueryType } from '~/querier/types.ts';
import type { BuilderInterface, IndexTypeClauseInterface } from '~/querier/interfaces.ts';

import { Descriptor, Objector } from '@zeero/commons';

@Descriptor({ properties: { enumerable: false } })
export class IndexType<T extends BuilderInterface<T>> implements IndexTypeClauseInterface<T> {
  public value: string = '';

  constructor(
    private _querier: T,
    public key: string = '',
  ) {}

  public hasType(): boolean {
    return !!this.value;
  }

  public type(value: string): this & T {
    this.value = value;
    return Objector.assign(this._querier, this);
  }

  public query(options: QueryType): QueryType {
    const text: Array<string> = [];

    if (this.hasType()) {
      text.push(this.key);
      text.push(this.value);
    }

    return {
      ...options,
      args: options.args,
      text: text.filter((s) => !!s).join(' '),
    };
  }
}

export default IndexType;
