import type { OrderClauseInterface } from '~/querier/interfaces.ts';
import type { OrderType, QueryType } from '~/querier/types.ts';

import Builder from '~/querier/services/builder.services.ts';
import Descriptor from '~/querier/decorations/descriptor.decoration.ts';

@Descriptor({ properties: { enumerable: false }})
export class Order<T> implements OrderClauseInterface<T> { 
  private orders: Array<OrderType> = []
  
  constructor(
    private _querier: T,
    public key: string = 'ORDER BY'
  ) {}

  hasOrders(): boolean {
    return this.orders.length > 0
  }

  asc(column: string): this & T;
  asc(column: any): this & T {
    this.orders.push({ key: 'asc', column });

    return Builder.assign(this._querier, this);
  }

  desc(column: string): this & T;
  desc(column: any): this & T {
    this.orders.push({ key: 'desc', column });

    return Builder.assign(this._querier, this);
  }  

  public query(options: QueryType): QueryType {
    const text: Array<string> = [];

    if (this.hasOrders()) {
      text.push(this.key)
      text.push(
        this.orders.map((order) => {
          return `${order.column} ${order.key.toUpperCase()}`
        }).join(', '),
      )
    }

    return { args: [], text: text.filter((s) => !!s).join(' ') }
  }
  
}

export default Order