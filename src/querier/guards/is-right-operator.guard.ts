import type { OperatorType } from '~/querier/types.ts';

export const isRightOperator = (x: any): x is OperatorType => {
  return !!x && ['is null', 'is not null'].includes(x)
}

export default isRightOperator
