import { QuerierInterface, StatementInterface } from '~/querier/interfaces.ts';
import {
  BracketFunction,
  SecondTermType,
  OperatorType,
  QueryArgType,
  QueryType,
  FirstTermType,
  ExpressionType,
  SubQueryType,
  StatementType,
} from '~/querier/types.ts';

import Querier from '~/querier/services/querier.services.ts';
import Operator from './operator.service.ts';

import isBracket from '~/querier/guards/is-bracket.guard.ts';
import isQuerier from '~/querier/guards/is-querier.guard.ts';
import isExpression from '~/querier/guards/is-expression.guard.ts';
import OperatorEnum from '~/querier/enums/operator.enum.ts';
import LeftOperatorEnum from '~/querier/enums/left-operator.enum.ts';
import RightOperatorEnum from '~/querier/enums/right-operator.enum.ts';
import MiddleOperatorEnum from '~/querier/enums/middle-operator.enum.ts';
import toExpression from '~/querier/guards/to-expression.guard.ts';

export class Statement implements StatementInterface {
  constructor(
    public query: QuerierInterface,
    public statement: Array<StatementType<'AND' | 'OR'>> = [],
  ) {}
  

  and(bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  and(operator: OperatorType, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  and(operator: OperatorType, secondTerm?: SecondTermType): this & QuerierInterface;
  and(firstTerm: FirstTermType, operator: OperatorType, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  and(firstTerm: FirstTermType, operator: OperatorType, secondTerm?: SecondTermType): this & QuerierInterface;
  and(firstTerm: any, operator?: any, secondTerm?: any): this & QuerierInterface {
    const statement: StatementType<'AND'> = {
      predicate: 'AND',
      expression: { firstTerm, operator, secondTerm } as ExpressionType,
    }

    if (isBracket(firstTerm)) {
      statement.expression = firstTerm(new Querier());
    }

    if (isBracket(secondTerm) && toExpression(statement.expression)) {
      statement.expression.secondTerm = secondTerm(new Querier());
    }

    if (isBracket(operator) && toExpression(statement.expression)) {
      statement.expression.secondTerm = operator(new Querier());
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

    this.statement.push(statement);

    return Object.assign(this, this.query);
  }

  or(bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  or(operator: OperatorType, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  or(operator: OperatorType, secondTerm?: SecondTermType): this & QuerierInterface;
  or(firstTerm: FirstTermType, operator: OperatorType, bracket: BracketFunction<SubQueryType>): this & QuerierInterface;
  or(firstTerm: FirstTermType, operator: OperatorType, secondTerm?: SecondTermType): this & QuerierInterface;
  or(firstTerm: unknown, operator?: unknown, secondTerm?: unknown): this & QuerierInterface {
    const statement: StatementType<'OR'> = {
      predicate: 'OR',
      expression: { firstTerm, operator, secondTerm } as ExpressionType,
    }

    if (isBracket(firstTerm)) {
      statement.expression = firstTerm(new Querier());
    }

    if (isBracket(secondTerm) && toExpression(statement.expression)) {
      statement.expression.secondTerm = secondTerm(new Querier());
    }

    if (isBracket(operator) && toExpression(statement.expression)) {
      statement.expression.secondTerm = operator(new Querier());
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

    this.statement.push(statement);

    return Object.assign(this, this.query);
  }

  toQuery(options: QueryArgType): QueryType {
    const text = this.statement.map((statement, index: number) => {
      let text = '';
      const predicate = `${index != 0 ? `${statement.predicate} ` : ''}`;

      const placeholder = `${options.placeholder ? options.placeholder : ''}`;

      if (isQuerier(statement.expression)) {
        const query = statement.expression.getQuery(options);
        text = `${predicate}(${query.text})`;
      }

      if (isExpression(statement.expression)) {
        const operator = `${Operator.translate(statement.expression.operator)}`;
        const firstTerm = statement.expression.firstTerm ?? '';

        if (isQuerier(statement.expression.secondTerm)) {
          const query = statement.expression.secondTerm.getQuery(options);
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

    return { text, ...options };
  }
}

export default Statement;
