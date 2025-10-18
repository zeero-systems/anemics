import type { QueryType } from '~/querier/types.ts';
import type { BuilderInterface, NameClauseInterface } from '~/querier/interfaces.ts';

import { Objector, Descriptor } from '@zeero/commons';

@Descriptor({ properties: { enumerable: false } })
export class Name<T extends BuilderInterface<T>> implements NameClauseInterface<T> {
  public value: string | string[] = '';

  constructor(
    private _querier: T,
    public key: string = '',
  ) {}

  public hasName(): boolean {
    return !!this.value;
  }

  public name(value: string | string[]): this & T {
    this.value = value;
    return Objector.assign(this._querier, this);
  }

  public query(options: QueryType): QueryType {
    const text: Array<string> = [];

    if (this.hasName()) {
      text.push(this.key);
      if (Array.isArray(this.value)) {
        text.push(`(${this.value.join(', ')})`);
      } else {
        text.push(this.value);
      }
    }

    return {
      ...options,
      args: options.args,
      text: text.filter((s) => !!s).join(' '),
    };
  }
}

export default Name;
