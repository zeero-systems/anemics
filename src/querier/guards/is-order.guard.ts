import { OrderInterface } from '~/querier/interfaces.ts';
import Order from '~/querier/adapters/sql/order.service.ts';

export const isOrder = (x: any): x is OrderInterface => {
  return x instanceof Order
}

export default isOrder