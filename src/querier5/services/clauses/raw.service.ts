import { QuerierOptionsType } from '~/querier/types.ts';
import { CommonInterface, RawInterface } from '~/querier/interfaces.ts';
import isQuerier from '~/querier/guards/is-querier.guard.ts';

export class Raw<T extends CommonInterface> implements RawInterface<T> {

  protected querier?: T;
  protected rawValue?: string;

  constructor(
    protected value: string | CommonInterface | any
  ) {
    if (isQuerier(value)) {
      this.querier = value as any
    } 
    
    if (typeof value == 'string') {
      this.rawValue = value
    }
  }

  hasRaw(): boolean {
    return !!this.rawValue
  }

  toRawQuery(options: QuerierOptionsType): QuerierOptionsType {
    return { ...options, text: this.rawValue || '' } 
  }
}

export default Raw