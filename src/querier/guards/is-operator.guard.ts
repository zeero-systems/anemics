import type { OperatorType } from '~/querier/types.ts';

export const isOperator = (x: any): x is OperatorType => {
  return !!x && ['exists','eq','lt','gt','like','between','in','not in','is null', 'is not null'].includes(x)
}

export default isOperator
