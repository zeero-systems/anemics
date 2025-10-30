import type { OperatorType } from '~/querier/types.ts';

export const isMiddleOperator = (x: any): x is OperatorType => {
  return !!x && ['eq', 'lt', 'gt', 'like', 'between', 'in', 'not in'].includes(x);
};

export default isMiddleOperator;
