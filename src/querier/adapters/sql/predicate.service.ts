import { QuerierInterface, PredicateInterface, RawInterface } from '~/querier/interfaces.ts';
import {
  BracketFunction,
  SecondTermType,
  OperatorType,
  QueryOptionType,
  QueryType,
  FirstTermType,
  ExpressionType,
  SubQueryType,
  PredicateType,
  PredicateKeyType,
} from '~/querier/types.ts';

import Sql from '~/querier/services/sql.service.ts';
import Operator from '~/querier/adapters/sql/operator.service.ts';

import isBracket from '~/querier/guards/is-bracket.guard.ts';
import isQuerier from '~/querier/guards/is-querier.guard.ts';
import isExpression from '~/querier/guards/is-expression.guard.ts';
import OperatorEnum from '~/querier/enums/operator.enum.ts';
import LeftOperatorEnum from '~/querier/enums/left-operator.enum.ts';
import RightOperatorEnum from '~/querier/enums/right-operator.enum.ts';
import MiddleOperatorEnum from '~/querier/enums/middle-operator.enum.ts';
import toExpression from '~/querier/guards/to-expression.guard.ts';
import isRaw from '~/querier/guards/is-raw.guard.ts';
import assign from '~/querier/functions/assign.function.ts';

export class Predicate implements PredicateInterface {
  
  public predicates: Array<PredicateType<'AND' | 'OR'>> = []
  
  constructor(
    protected query: QuerierInterface,
    protected predicateKey: PredicateKeyType = 'WHERE'
  ) {}
  
  hasPredicates(): boolean {
    return this.predicates.length > 0
  }

  and(raw: RawInterface): this & QuerierInterface;
  and(bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  and(operator: OperatorType, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  and(operator: OperatorType, secondTerm?: SecondTermType): this & QuerierInterface;
  and(firstTerm: FirstTermType, operator: OperatorType, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  and(firstTerm: FirstTermType, operator: OperatorType, secondTerm?: SecondTermType): this & QuerierInterface;
  and(firstTerm: any, operator?: any, secondTerm?: any): this & QuerierInterface {
    const statement: PredicateType<'AND'> = {
      type: 'AND',
      expression: { firstTerm, operator, secondTerm } as ExpressionType,
    }

    if (isBracket(firstTerm)) {
      statement.expression = firstTerm(new Sql());
    }
    
    if (isRaw(firstTerm)) {
      statement.expression = firstTerm;
    }

    if (isBracket(secondTerm) && toExpression(statement.expression)) {
      statement.expression.secondTerm = secondTerm(new Sql());
    }

    if (isBracket(operator) && toExpression(statement.expression)) {
      statement.expression.secondTerm = operator(new Sql());
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
    
    return assign(this, this.query)
  }

  or(raw: RawInterface): this & QuerierInterface;
  or(bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  or(operator: OperatorType, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  or(operator: OperatorType, secondTerm?: SecondTermType): this & QuerierInterface;
  or(firstTerm: FirstTermType, operator: OperatorType, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  or(firstTerm: FirstTermType, operator: OperatorType, secondTerm?: SecondTermType): this & QuerierInterface;
  or(firstTerm: any, operator?: any, secondTerm?: any): this & QuerierInterface {
    const statement: PredicateType<'OR'> = {
      type: 'OR',
      expression: { firstTerm, operator, secondTerm } as ExpressionType,
    }

    if (isBracket(firstTerm)) {
      statement.expression = firstTerm(new Sql());
    }

    if (isRaw(firstTerm)) {
      statement.expression = firstTerm;
    }

    if (isBracket(secondTerm) && toExpression(statement.expression)) {
      statement.expression.secondTerm = secondTerm(new Sql());
    }

    if (isBracket(operator) && toExpression(statement.expression)) {
      statement.expression.secondTerm = operator(new Sql());
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

    return assign(this, this.query)
  }

  toPredicateQuery(options: QueryOptionType): QueryType {

    let text = ''

    if (this.hasPredicates()) {
      text = this.predicates.map((statement, index: number) => {
        let text = '';
        const predicate = `${index != 0 ? `${statement.type} ` : ''}`;
  
        const placeholder = `${options.placeholder ? options.placeholder : ''}`;
  
        if (isQuerier(statement.expression)) {
          const query = statement.expression.toQuery(options);
          text = `${predicate}(${query.text})`;
        }
  
        if (isRaw(statement.expression)) {
          const query = statement.expression.toRawQuery(options);
          text = `${predicate}(${query.text})`;
        }
  
        if (isExpression(statement.expression)) {
          const operator = `${Operator.translate(statement.expression.operator)}`;
          const firstTerm = statement.expression.firstTerm ?? '';
  
          if (isQuerier(statement.expression.secondTerm)) {
            const query = statement.expression.secondTerm.toQuery(options);
            text = `${predicate}${operator} (${query.text})`;
          }
  
          if (!isQuerier(statement.expression.secondTerm)) {
            if (statement.expression.operator in LeftOperatorEnum) {
              options.args.push(statement.expression.secondTerm as any);
              options.counter += 1;
              text = `${predicate}${operator} `;
  
              if (placeholder) {
                if (options.placeholderType == 'counter') {
                  text = `${text}${placeholder}${options.counter}`;
                } else {
                  text = `${text}${placeholder}`;
                }
              } else {
                text = `${text}${statement.expression.secondTerm}`;
              }
            }
  
            if (statement.expression.operator in MiddleOperatorEnum) {
              if (Array.isArray(statement.expression.secondTerm)) {
                if (statement.expression.operator == OperatorEnum.BETWEEN) {
                  options.args.push(...statement.expression.secondTerm as any);
                  options.counter += statement.expression.secondTerm.length;
  
                  text = `${predicate}${firstTerm} ${operator} `;
  
                  if (placeholder) {
                    if (options.placeholderType == 'counter') {
                      text = `${text}${placeholder}${options.counter - 1} AND ${placeholder}${options.counter}`;
                    } else {
                      text = `${text}${placeholder} AND ${placeholder}`;
                    }
                  } else {
                    text = `${text}${statement.expression.secondTerm[0]} AND ${statement.expression.secondTerm[1]}`;
                  }
                }
                if (
                  statement.expression.operator == OperatorEnum.IN ||
                  statement.expression.operator == OperatorEnum.NOT_IN
                ) {
                  text = `${predicate}${firstTerm} ${operator} (${
                    statement.expression.secondTerm.map((term, index) => {
                      if (placeholder) {
                        if (options.placeholderType == 'counter') {
                          return `${placeholder}${index + options.counter + 1}`;
                        } else {
                          return `${placeholder}`;
                        }
                      }
                      return term;
                    }).join(', ')
                  })`;
  
                  options.args.push(...statement.expression.secondTerm as any);
                  options.counter += statement.expression.secondTerm.length;
                }
              } else {
                options.args.push(statement.expression.secondTerm as any);
                options.counter += 1;
                text = `${predicate}${firstTerm} ${operator} `;
  
                if (placeholder) {
                  if (options.placeholderType == 'counter') {
                    text = `${text}${placeholder}${options.counter}`;
                  } else {
                    text = `${text}${placeholder}`;
                  }
                } else {
                  text = `${text}${statement.expression.secondTerm}`;
                }
              }
            }
  
            if (statement.expression.operator in RightOperatorEnum) {
              text = `${predicate}${statement.expression.firstTerm} ${operator}`;
            }
          }
        }
  
        return text;
      }).filter((s) => !!s).join(' ');

      text = `${this.predicateKey} ${text}`
    }

    return { text, ...options };
  }
}

export default Predicate;
