import OperatorEnum from '~/querier/enums/operator.enum.ts';

export const isLeftOperator = (x: any): x is OperatorEnum => {
  return !!x && ['exists'].includes(x);
};

export default isLeftOperator;
