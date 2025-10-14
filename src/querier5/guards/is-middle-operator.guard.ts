import OperatorEnum from '~/querier/enums/operator.enum.ts';

export const isMiddleOpeartor = (x: any): x is OperatorEnum => {
  return !!x && ['eq','lt','gt','like','between','in','not in'].includes(x)
}

export default isMiddleOpeartor
