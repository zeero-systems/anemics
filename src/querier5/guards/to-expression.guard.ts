import { ExpressionType } from '~/querier/types.ts';

export const toExpression = (x: any): x is ExpressionType => {
  return !!x
}

export default toExpression