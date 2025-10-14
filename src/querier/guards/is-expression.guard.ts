import type { ExpressionType } from '~/querier/types.ts';

export const isExpression = (x: any): x is ExpressionType => {
  return !!x && !!x.operator
}

export default isExpression