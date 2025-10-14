import type { QuerierOptionsType, ValueType } from '~/querier/types.ts';
import type { ActionInterface, CommonInterface, RawInterface } from '~/querier/interfaces.ts';

import isQuerier from '~/querier/guards/is-querier.guard.ts';
import isRawwer from '~/querier/guards/is-raw.guard.ts';

export class Action<T extends CommonInterface, K> implements ActionInterface<T, K> {
  
  public actionValue: ValueType | undefined
  
  constructor(protected querier: T) { }

  hasAction(): boolean {
    return typeof this.actionValue !== 'undefined'
  }

  action(raw: RawInterface<T>): this & T;
  action(value: K): this & T;
  action(value: any): this & T {
    this.actionValue = value
    return this.querier.queue(this)
  }
  
  toActionQuery(options: QuerierOptionsType): QuerierOptionsType {
    let text: string = ''

    if (isQuerier(this.actionValue)) {
      text = this.actionValue.toQuery(options).text
    }

    if (isRawwer(this.actionValue)) {
      text = this.actionValue.toRawQuery(options).text
    }

    if (typeof this.actionValue != 'undefined') {
      text = String(this.actionValue).toUpperCase()
    }


    return { ...options, text }
  }
  
}

export default Action