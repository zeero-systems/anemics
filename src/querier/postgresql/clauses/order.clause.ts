import type { BuilderInterface, OrderClauseInterface } from '~/querier/interfaces.ts';
import type { OrderType, QueryType } from '~/querier/types.ts';

import { Descriptor, Objector } from '@zeero/commons';

@Descriptor({ properties: { enumerable: false } })
export class Order<T extends BuilderInterface<T>> implements OrderClauseInterface<T> {
  private orders: Array<OrderType> = [];

  constructor(
    private _querier: T,
    public key: string = 'ORDER BY',
  ) {}

  hasOrders(): boolean {
    return this.orders.length > 0;
  }

  asc(column: string): this & T;
  asc(column: any): this & T {
    this.orders.push({ key: 'asc', column });

    return Objector.assign(this._querier, this);
  }

  desc(column: string): this & T;
  desc(column: any): this & T {
    this.orders.push({ key: 'desc', column });

    return Objector.assign(this._querier, this);
  }

  public query(options: QueryType): QueryType {
    const text: Array<string> = [];

    if (this.hasOrders()) {
      text.push(this.key);
      text.push(
        this.orders.map((order) => {
          return `${order.column} ${order.key.toUpperCase()}`;
        }).join(', '),
      );
    }

    return {
      ...options,
      args: options.args,
      text: text.filter((s) => !!s).join(' '),
    };
  }
}

export default Order;
