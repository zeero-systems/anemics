import type { OperatorType } from '~/querier/types.ts';
import OperatorEnum from '~/querier/enums/operator.enum.ts';

export class Operator {
  static translate(operator: OperatorType): string {
    if (operator == OperatorEnum.EQ) return '='
    if (operator == OperatorEnum.GT) return '>'
    if (operator == OperatorEnum.LT) return '<'

    return String(OperatorEnum[operator.toUpperCase() as Uppercase<OperatorEnum>]).toUpperCase()
  } 
}

export default Operator