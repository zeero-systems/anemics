import type { BuilderInterface, PredicateClauseInterface, RawClauseInterface } from '~/querier/interfaces.ts';
import type { OperatorType, PredicateType, QueryFunction, QueryType, TermType } from '~/querier/types.ts';

import { Objector, Descriptor } from '@zeero/commons';

import isExpression from '~/querier/guards/is-expression.guard.ts';
import isMiddleOpeartor from '~/querier/guards/is-middle-operator.guard.ts';
import isQueryFunction from '~/querier/guards/is-query-function.guard.ts';
import isOperator from '~/querier/guards/is-operator.guard.ts';
import isBuilder from '~/querier/guards/is-builder.guard.ts';
import isRaw from '~/querier/guards/is-raw.guard.ts';
import isLeftOperator from '~/querier/guards/is-left-operator.guard.ts';
import isRightOperator from '~/querier/guards/is-right-operator.guard.ts';

@Descriptor({ properties: { enumerable: false } })
export class Predicate<T extends BuilderInterface<T>> implements PredicateClauseInterface<T> {
  public predicates: Array<PredicateType> = [];

  constructor(
    private _querier: T,
    public key: string = '',
  ) {}

  public hasPredicates(): boolean {
    return this.predicates.length > 0;
  }

  public and(raw: RawClauseInterface<T>): this & T;
  public and(query: QueryFunction<T>): this & T;
  public and(operator: OperatorType, query: QueryFunction<T>): this & T;
  public and(operator: OperatorType, rightTerm?: TermType): this & T;
  public and(leftTerm: TermType, operator: OperatorType, query: QueryFunction<T>): this & T;
  public and(leftTerm: TermType, operator: OperatorType, rightTerm: TermType): this & T;
  public and(leftTerm: any, operator?: any, rightTerm?: any): this & T {
    const predicate: PredicateType = {
      type: 'and',
      expression: { leftTerm, operator, rightTerm },
    };

    if (isQueryFunction(leftTerm)) {
      predicate.expression = leftTerm(this._querier.instantiate());
    }

    if (isQueryFunction(operator)) {
      predicate.expression.rightTerm = operator(this._querier.instantiate());
    }

    if (isQueryFunction(rightTerm)) {
      predicate.expression.rightTerm = rightTerm(this._querier.instantiate());
    }

    if (isOperator(leftTerm)) {
      predicate.expression.leftTerm = '';
      predicate.expression.operator = leftTerm;

      if (!isQueryFunction(operator)) {
        predicate.expression.rightTerm = operator;
      }
    }

    this.predicates.push(predicate);

    return Objector.assign(this._querier, this);
  }

  public or(raw: RawClauseInterface<T>): this & T;
  public or(query: QueryFunction<T>): this & T;
  public or(operator: OperatorType, query: QueryFunction<T>): this & T;
  public or(operator: OperatorType, rightTerm?: TermType): this & T;
  public or(leftTerm: TermType, operator: OperatorType, query: QueryFunction<T>): this & T;
  public or(leftTerm: TermType, operator: OperatorType, rightTerm: TermType): this & T;
  public or(leftTerm: any, operator?: any, rightTerm?: any): this & T {
    const predicate: PredicateType = {
      type: 'or',
      expression: { leftTerm, operator, rightTerm },
    };

    if (isQueryFunction(leftTerm)) {
      predicate.expression = leftTerm(this._querier.instantiate());
    }

    if (isQueryFunction(operator)) {
      predicate.expression.rightTerm = operator(this._querier.instantiate());
    }

    if (isQueryFunction(rightTerm)) {
      predicate.expression.rightTerm = rightTerm(this._querier.instantiate());
    }

    if (isOperator(leftTerm)) {
      predicate.expression.leftTerm = '';
      predicate.expression.operator = leftTerm;

      if (!isQueryFunction(operator)) {
        predicate.expression.rightTerm = operator;
      }
    }

    this.predicates.push(predicate);

    return Objector.assign(this._querier, this);
  }

  protected toNaturalOperator(operator: OperatorType): string {
    if (operator == 'eq') return '=';
    if (operator == 'gt') return '>';
    if (operator == 'lt') return '<';

    return operator;
  }

  public query(options: QueryType): QueryType {
    const text: Array<string> = [];

    if (this.hasPredicates()) {
      text.push(this.key);
      text.push(
        ...this.predicates.map((predicate, index: number) => {
          let text = '';
          const type = `${index != 0 ? `${predicate.type} ` : ''}`;

          const placeholder = `${options?.placeholder ? options.placeholder : ''}`;

          if (isBuilder(predicate.expression)) {
            const query = predicate.expression.toQuery(options);
            text = `${type}(${query.text})`;
          }

          if (isRaw(predicate.expression.leftTerm)) {
            const query = predicate.expression.leftTerm.query(options);
            text = `${type}(${query.text})`;
          }

          if (isExpression(predicate.expression)) {
            const operator = this.toNaturalOperator(predicate.expression.operator).toUpperCase();
            const leftTerm = predicate.expression.leftTerm ?? '';

            if (isBuilder(predicate.expression.rightTerm)) {
              const query = predicate.expression.rightTerm.toQuery(options);
              text = `${type}${operator} (${query.text})`;
            }

            if (!isBuilder(predicate.expression.rightTerm)) {
              if (isLeftOperator(predicate.expression.operator)) {
                options.args.push(predicate.expression.rightTerm as any);
                text = `${type}${operator}`;

                if (placeholder) {
                  if (options.placeholderType == 'counter') {
                    text = `${text} ${placeholder}${options.args.length}`;
                  } else {
                    text = `${text} ${placeholder}`;
                  }
                } else {
                  text = `${text} ${predicate.expression.rightTerm}`;
                }
              }

              if (isMiddleOpeartor(predicate.expression.operator)) {
                if (Array.isArray(predicate.expression.rightTerm)) {
                  if (predicate.expression.operator == 'between') {
                    options.args.push(...predicate.expression.rightTerm as any);

                    text = `${type}${leftTerm} ${operator}`;

                    if (placeholder) {
                      if (options.placeholderType == 'counter') {
                        text = `${text} ${placeholder}${
                          options.args.length - 1
                        } AND ${placeholder}${options.args.length}`;
                      } else {
                        text = `${text} ${placeholder} AND ${placeholder}`;
                      }
                    } else {
                      text = `${text} ${predicate.expression.rightTerm[0]} AND ${predicate.expression.rightTerm[1]}`;
                    }
                  }
                  if (
                    predicate.expression.operator == 'in' ||
                    predicate.expression.operator == 'not in'
                  ) {
                    text = `${type}${leftTerm} ${operator} (${
                      predicate.expression.rightTerm.map((term) => {
                        options.args.push(term as any);
                        if (placeholder) {
                          if (options.placeholderType == 'counter') {
                            return `${placeholder}${options.args.length}`;
                          } else {
                            return `${placeholder}`;
                          }
                        }
                        return term;
                      }).join(', ')
                    })`;
                  }
                } else {
                  options.args.push(predicate.expression.rightTerm as any);
                  text = `${type}${leftTerm} ${operator}`;

                  if (placeholder) {
                    if (options.placeholderType == 'counter') {
                      text = `${text} ${placeholder}${options.args.length}`;
                    } else {
                      text = `${text} ${placeholder}`;
                    }
                  } else {
                    text = `${text} ${predicate.expression.rightTerm}`;
                  }
                }
              }

              if (isRightOperator(predicate.expression.operator)) {
                text = `${type}${predicate.expression.leftTerm} ${operator}`;
              }
            }
          }

          return text;
        }),
      );
    }

    return {
      ...options,
      args: options.args,
      text: text.filter((s) => !!s).join(' '),
    };
  }
}

export default Predicate;
