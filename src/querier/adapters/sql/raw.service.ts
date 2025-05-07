import { QueryOptionType, QueryType } from '~/querier/types.ts';
import { QuerierInterface, RawInterface } from '~/querier/interfaces.ts';
import isQuerier from '~/querier/guards/is-querier.guard.ts';

export class Raw implements RawInterface {

  protected query?: QuerierInterface;
  protected rawValue?: string;

  constructor(
    protected value: string | QuerierInterface | any
  ) {
    if (isQuerier(value)) {
      this.query = value
    } 
    
    if (typeof value == 'string') {
      this.rawValue = value
    }
  }

  hasRaw(): boolean {
    return !!this.rawValue
  }

  toRawQuery(options: QueryOptionType): QueryType {
    return { text: this.rawValue || '', ...options } 
  }
}

export default Raw