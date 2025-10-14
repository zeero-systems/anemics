import { PredicateInterface, RawInterface, CommonInterface } from '~/querier/interfaces.ts';
import {
  BracketFunction,
  SecondTermType,
  OperatorType,
  FirstTermType,
  ExpressionType,
  PredicateType,
  PredicateKeyType,
} from '~/querier/types.ts';

import type { QuerierOptionsType } from '~/querier/types.ts';

import Operator from '~/querier/services/clauses/operator.service.ts';

import isBracket from '~/querier/guards/is-bracket.guard.ts';
import isQuery from '~/querier/guards/is-querier.guard.ts';
import isExpression from '~/querier/guards/is-expression.guard.ts';
import OperatorEnum from '~/querier/enums/operator.enum.ts';
import toExpression from '~/querier/guards/to-expression.guard.ts';
import isRaw from '~/querier/guards/is-raw.guard.ts';

import assign from '~/querier/functions/assign.function.ts';
import isLeftOperator from '~/querier/guards/is-left-operator.guard.ts';
import isMiddleOperator from '~/querier/guards/is-middle-operator.guard.ts';
import isRightOperator from '~/querier/guards/is-right-operator.guard.ts';

export class Predicate<T extends CommonInterface> implements PredicateInterface<T> {
  
  protected predicates: Array<PredicateType<'AND' | 'OR'>> = []
  
  constructor(
    protected querier: T,
    protected predicateKey: PredicateKeyType = 'WHERE'
  ) {}
  
  hasPredicates(): boolean {
    return this.predicates.length > 0
  }

  and(raw: RawInterface<T>): this & T;
  and(bracket: BracketFunction<T>): this & T;
  and(operator: OperatorType, bracket: BracketFunction<T>): this & T;
  and(operator: OperatorType, secondTerm?: SecondTermType): this & T;
  and(firstTerm: FirstTermType, operator: OperatorType, bracket: BracketFunction<T>): this & T;
  and(firstTerm: FirstTermType, operator: OperatorType, secondTerm?: SecondTermType): this & T;
  and(firstTerm: any, operator?: any, secondTerm?: any): this & T {
    const statement: PredicateType<'AND'> = {
      type: 'AND',
      expression: { firstTerm, operator, secondTerm } as ExpressionType,
    }

    if (isBracket(firstTerm)) {
      statement.expression = firstTerm(this.querier.instantiate());
    }
    
    if (isRaw(firstTerm)) {
      statement.expression = firstTerm;
    }

    if (isBracket(secondTerm) && toExpression(statement.expression)) {
      statement.expression.secondTerm = secondTerm(this.querier.instantiate());
    }

    if (isBracket(operator) && toExpression(statement.expression)) {
      statement.expression.secondTerm = operator(this.querier.instantiate());
    }

    if (typeof firstTerm == 'string' && firstTerm in OperatorEnum && toExpression(statement.expression)) {
      statement.expression.firstTerm = '';
      // @ts-ignore we are forcefully changing values
      statement.expression.operator = firstTerm;

      if (!isBracket(operator)) {
        // @ts-ignore we are forcefully changing values
        statement.expression.secondTerm = operator;
      }
    }

    this.predicates.push(statement);
    
    return assign(this, this.querier)
  }

  or(raw: RawInterface<T>): this & T;
  or(bracket: BracketFunction<T>): this & T;
  or(operator: OperatorType, bracket: BracketFunction<T>): this & T;
  or(operator: OperatorType, secondTerm?: SecondTermType): this & T;
  or(firstTerm: FirstTermType, operator: OperatorType, bracket: BracketFunction<T>): this & T;
  or(firstTerm: FirstTermType, operator: OperatorType, secondTerm?: SecondTermType): this & T;
  or(firstTerm: any, operator?: any, secondTerm?: any): this & T {
    const statement: PredicateType<'OR'> = {
      type: 'OR',
      expression: { firstTerm, operator, secondTerm } as ExpressionType,
    }

    if (isBracket(firstTerm)) {
      statement.expression = firstTerm(this.querier.instantiate());
    }

    if (isRaw(firstTerm)) {
      statement.expression = firstTerm;
    }

    if (isBracket(secondTerm) && toExpression(statement.expression)) {
      statement.expression.secondTerm = secondTerm(this.querier.instantiate());
    }

    if (isBracket(operator) && toExpression(statement.expression)) {
      statement.expression.secondTerm = operator(this.querier.instantiate());
    }

    if (typeof firstTerm == 'string' && firstTerm in OperatorEnum && toExpression(statement.expression)) {
      statement.expression.firstTerm = '';
      // @ts-ignore we are forcefull changing values
      statement.expression.operator = firstTerm;

      if (!isBracket(operator)) {
        // @ts-ignore we are forcefull changing values
        statement.expression.secondTerm = operator;
      }
    }

    this.predicates.push(statement);

    return assign(this, this.querier)
  }

  toPredicateQuery(options: QuerierOptionsType): QuerierOptionsType {

    let text = ''

    if (this.hasPredicates()) {
      text = this.predicates.map((statement, index: number) => {
        let text = '';
        const predicate = `${index != 0 ? `${statement.type} ` : ''}`;
  
        const placeholder = `${options.placeholder ? options.placeholder : ''}`;
  
        if (isQuery(statement.expression)) {
          const query = statement.expression.toQuery(options);
          text = `${predicate}(${query.text})`;
        }
  
        if (isRaw(statement.expression)) {
          const query = (statement.expression as any).toRawQuery(options);
          text = `${predicate}(${query.text})`;
        }
  
        if (isExpression(statement.expression)) {
          const operator = `${Operator.translate(statement.expression.operator)}`;
          const firstTerm = statement.expression.firstTerm ?? '';
  
          if (isQuery(statement.expression.secondTerm)) {
            const query = statement.expression.secondTerm.toQuery(options);
            text = `${predicate}${operator} (${query.text})`;
          }
  
          if (!isQuery(statement.expression.secondTerm)) {
            if (isLeftOperator(statement.expression.operator)) {
              options.args.push(statement.expression.secondTerm as any);
              text = `${predicate}${operator} `;
  
              if (placeholder) {
                if (options.placeholderType == 'counter') {
                  text = `${text}${placeholder}${options.args.length}`;
                } else {
                  text = `${text}${placeholder}`;
                }
              } else {
                text = `${text}${statement.expression.secondTerm}`;
              }
            }
  
            if (isMiddleOperator(statement.expression.operator)) {
              if (Array.isArray(statement.expression.secondTerm)) {
                if (statement.expression.operator == OperatorEnum.BETWEEN) {
                  options.args.push(...statement.expression.secondTerm as any);
  
                  text = `${predicate}${firstTerm} ${operator} `;
  
                  if (placeholder) {
                    if (options.placeholderType == 'counter') {
                      text = `${text}${placeholder}${options.args.length - 1} AND ${placeholder}${options.args.length}`;
                    } else {
                      text = `${text}${placeholder} AND ${placeholder}`;
                    }
                  } else {
                    text = `${text}${statement.expression.secondTerm[0]} AND ${statement.expression.secondTerm[1]}`;
                  }
                }
                if (
                  statement.expression.operator == OperatorEnum.IN ||
                  statement.expression.operator == OperatorEnum['NOT IN']
                ) {
                  
                  text = `${predicate}${firstTerm} ${operator} (${
                    statement.expression.secondTerm.map((term) => {
                      options.args.push(term as any);
                      if (placeholder) {
                        if (options.placeholderType == 'counter') {
                          return `${placeholder}${options.args.length }`;
                        } else {
                          return `${placeholder}`;
                        }
                      }
                      return term;
                    }).join(', ')
                  })`;
                }
              } else {
                options.args.push(statement.expression.secondTerm as any);
                text = `${predicate}${firstTerm} ${operator} `;
  
                if (placeholder) {
                  if (options.placeholderType == 'counter') {
                    text = `${text}${placeholder}${options.args.length}`;
                  } else {
                    text = `${text}${placeholder}`;
                  }
                } else {
                  text = `${text}${statement.expression.secondTerm}`;
                }
              }
            }
  
            if (isRightOperator(statement.expression.operator)) {
              text = `${predicate}${statement.expression.firstTerm} ${operator}`;
            }
          }
        }
  
        return text;
      }).filter((s) => !!s).join(' ');

      const allowedKeyWithSteps = ['toSelectQuery', 'toDeleteQuery', 'toUpdateQuery']

      if (options.steps?.find((key: string) => allowedKeyWithSteps.includes(key))) {
        text = `${this.predicateKey} ${text}`
      }
    }

    return { ...options, text };
  }
}

export default Predicate;
