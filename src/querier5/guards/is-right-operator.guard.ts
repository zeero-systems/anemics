import OperatorEnum from '~/querier/enums/operator.enum.ts';

export const isRightOpeartor = (x: any): x is OperatorEnum => {
  return !!x && ['is null', 'is not null'].includes(x)
}

export default isRightOpeartor
