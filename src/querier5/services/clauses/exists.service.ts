import type { QuerierOptionsType, ValueType } from '~/querier/types.ts';
import type { ExistsInterface, CommonInterface, RawInterface } from '~/querier/interfaces.ts';

import isQuerier from '~/querier/guards/is-querier.guard.ts';
import isRawwer from '~/querier/guards/is-raw.guard.ts';

export class Exists<T extends CommonInterface> implements ExistsInterface<T> {
  
  public existsValue: ValueType | boolean | undefined
  
  constructor(protected querier: T) { }

  hasExists(): boolean {
    return typeof this.existsValue !== 'undefined'
  }

  exists(raw: RawInterface<T>): this & T;
  exists(value: boolean): this & T;
  exists(value: any): this & T {
    this.existsValue = value
    return this.querier.queue(this)
  }

  toExistsQuery(options: QuerierOptionsType): QuerierOptionsType {
    let text: string = ''

    if (isQuerier(this.existsValue)) {
      text = this.existsValue.toQuery(options).text
    }

    if (isRawwer(this.existsValue)) {
      text = this.existsValue.toRawQuery(options).text
    }

    if (typeof this.existsValue != 'undefined') {
      text = this.existsValue ? 'IF EXISTS' : 'IF NOT EXISTS'
    }


    return { ...options, text }
  }
  
}

export default Exists