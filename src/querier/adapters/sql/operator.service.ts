import OperatorEnum from '~/querier/enums/operator.enum.ts';
import { OperatorType } from '~/querier/types.ts';

export class Operator {
  static translate(operator: OperatorEnum): string {
    if (operator == OperatorEnum.EQ) return '='
    if (operator == OperatorEnum.GT) return '>'
    if (operator == OperatorEnum.LT) return '<'
    
    return OperatorEnum[operator as OperatorType]
  } 
}

export default Operator