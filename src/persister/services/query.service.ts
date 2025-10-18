import type { NewableType } from '@zeero/commons';
import type { QueryType } from '~/querier/types.ts';
import type { RepositoryInterface, RepositoryQueryInterface } from '~/persister/interfaces.ts';
import type {
  ActionOptionsType,
  ExecuteResultType,
  FilterPredicateType,
  FilterType,
  SearchOptionsType,
} from '~/persister/types.ts';
import type { QueryQuerierInterface } from '~/querier/interfaces.ts';

import { DecoratorMetadata, isBoolean, isString, Objector, Text } from '@zeero/commons';

import SchemaAnnotation from '~/persister/annotations/schema.annotation.ts';
import Raw from '~/querier/services/raw.clause.ts';

import isFilterPredicate from '~/persister/guards/is-filter-predicate.guard.ts';
import isFilter from '~/persister/guards/is-filter.guard.ts';

export class Query<T extends NewableType<T>> implements RepositoryQueryInterface<T> {
  constructor(public repository: RepositoryInterface<T>) {}

  public createQuery(records: Array<InstanceType<T>>, options?: ActionOptionsType): Array<QueryType> {
    const queriers = [];

    if (this.repository.annotation) {
      for (const record of records) {
        const entity = record as any;
        const query = this.repository.querier.query;
        const insert = query.insert;
        const returns = query.returns

        insert.table(this.repository.annotation.table);

        for (const decoration of this.repository.annotation.columns) {
          const propertyKey = String(decoration.key);
          const transformedPropertyKey = this.repository.options.toTableNaming(decoration.key);
          if (typeof entity[propertyKey] !== 'undefined') {
            insert.column(transformedPropertyKey, entity[propertyKey]);
          } else {
            if (typeof decoration.annotation.options?.default !== 'undefined') {
              insert.column(transformedPropertyKey, decoration.annotation.options?.default);
            }
          }
          if (!options?.returns || options.returns.includes(propertyKey)) {
            returns.column(transformedPropertyKey);
          }
        }

        queriers.push(query.toQuery());
      }
    }

    return queriers;
  }

  public createExecute(
    records: Array<InstanceType<T>>,
    options?: ActionOptionsType,
  ): Promise<Array<ExecuteResultType<InstanceType<T>>>> {
    return this.repository.execute(this.createQuery(records, options), options);
  }

  public create(record: InstanceType<T>, options?: ActionOptionsType): Promise<InstanceType<T>> {
    return this.createExecute([record], options).then((results) => {
      return results[0].rows[0];
    });
  }

  public createMany(records: Array<InstanceType<T>>, options?: ActionOptionsType): Promise<Array<InstanceType<T>>> {
    return this.createExecute(records, options).then((results) => {
      return results.reduce((a, b) => {
        a.push(...b.rows);
        return a;
      }, [] as any);
    });
  }

  public updateQuery(records: Array<Partial<InstanceType<T>>>, options?: ActionOptionsType): Array<QueryType> {
    const queriers = [];

    if (this.repository.annotation) {
      const primaryColumn = this.repository.annotation.columns.find((column) => column.annotation.options?.primary);

      if (primaryColumn) {
        
        for (const record of records) {
          const entity = record as any;
          const query = this.repository.querier.query;
          const where = query.where
          const update = query.update.table(this.repository.annotation.table);
          const returner = query.returns
          const returns = []

          for (const decoration of this.repository.annotation.columns) {
            const propertyKey = String(decoration.key);
            const transformedPropertyKey = this.repository.options.toTableNaming(decoration.key);

            if (propertyKey != primaryColumn.key) {
              if (typeof entity[propertyKey] !== 'undefined') {
                update.column(transformedPropertyKey, entity[propertyKey]);
              }
              if (!options?.returns || options.returns.includes(propertyKey)) {
                returns.push(transformedPropertyKey);
              }
            } else {
              where.and(propertyKey, 'eq', entity[propertyKey]);
              returns.push(transformedPropertyKey);
            }
          }
          for (const r of returns) {
            returner.column(r)
          }
          queriers.push(query.toQuery());
        }
      }
    }

    return queriers;
  }

  public updateExecute(
    records: Array<Partial<InstanceType<T>>>,
    options?: ActionOptionsType,
  ): Promise<Array<ExecuteResultType<InstanceType<T>>>> {
    return this.repository.execute(this.updateQuery(records, options), options);
  }

  public update(record: Partial<InstanceType<T>>, options?: ActionOptionsType): Promise<InstanceType<T>> {
    return this.updateExecute([record], options).then((results) => {
      return results[0].rows[0];
    });
  }

  public updateMany(records: Array<InstanceType<T>>, options?: ActionOptionsType): Promise<Array<InstanceType<T>>> {
    return this.updateExecute(records, options).then((results) => {
      return results.reduce((a, b) => {
        a.push(...b.rows);
        return a;
      }, [] as any);
    });
  }

  public deleteQuery(where: FilterPredicateType, options?: ActionOptionsType): QueryType {
    const opts = { ...this.getQueryOptions(), alias: undefined }

    if (this.repository.annotation) {
      opts.instance.delete.table(this.repository.annotation.table);
    }

    this.setWhereQuery({ where }, opts);

    if (options?.returns) {
      for (const column of options?.returns) {
        opts.instance.returns.column(column);
      }
    }

    return opts.query.toQuery();
  }

  public deleteExecute(
    where: FilterPredicateType,
    options?: ActionOptionsType,
  ): Promise<Array<ExecuteResultType<InstanceType<T>>>> {
    return this.repository.execute([this.deleteQuery(where, options)], options);
  }

  public delete(query: FilterPredicateType | InstanceType<T>, options?: ActionOptionsType): Promise<InstanceType<T>> {
    let where: FilterPredicateType = {};
    if (!isFilterPredicate(query)) {
      if (this.repository.annotation) {
        const primaryColumn = this.repository.annotation.columns.find((column) => column.annotation.options?.primary);

        if (primaryColumn) {
          where = { and: [{ [primaryColumn.key]: { eq: (query as any)[primaryColumn.key] } }] };
        }
      }
    } else {
      where = query;
    }

    return this.deleteExecute(where, options).then((results) => {
      const lastResultIndex = results.length - 1;
      const lastRowIndex = results[lastResultIndex]?.rows.length - 1;
      return results[lastResultIndex].rows[lastRowIndex];
    });
  }

  public deleteMany(
    queries: Array<FilterPredicateType | InstanceType<T>>,
    options?: ActionOptionsType,
  ): Promise<Array<InstanceType<T>>> {
    const where: FilterPredicateType = { or: [] };

    for (const query of queries) {
      if (!isFilterPredicate(query)) {
        if (this.repository.annotation) {
          const primaryColumn = this.repository.annotation.columns.find((column) => column.annotation.options?.primary);

          if (primaryColumn) {
            where.or?.push({ and: [{ [primaryColumn.key]: { eq: (query as any)[primaryColumn.key] } }] });
          }
        }
      } else {
        where.or?.push(query);
      }
    }

    return this.deleteExecute(where, options).then((results) => {
      return results[0].rows;
    });
  }

  public getQueryOptions(options?: Partial<SearchOptionsType>): SearchOptionsType {
    const alias = Text.getNextLetter(options?.alias);
    const query = options?.query ?? this.repository.querier.query;
    const schema = options?.schema ?? this.repository.annotation;

    return {
      alias,
      query,
      schema,
      instance: {
        select: query.select,
        delete: query.delete,
        from: query.from,
        order: query.order,
        where: query.where,
        limit: query.limit,
        offset: query.offset,
        returns: query.returns,
        group: query.group,
      },
    };
  }

  public searchQuery(search: FilterType, options?: SearchOptionsType): QueryType {
    return this.setSearchQuery(search, this.getQueryOptions(options)).toQuery();
  }

  protected toJsonBuild(columnPairs: Array<string>): string {
    return `json_build_object(${columnPairs.join(', ')})`;
  }

  protected toJsonAggregate(columnPairs: Array<string>, filter: any = { key: '', value: '' }): string {
    if (filter.key) {
      return `COALESCE (json_agg(json_build_object(${columnPairs.join(', ')})) ${filter.key}, ${filter.value})`;
    }
    return `json_agg(${this.toJsonBuild(columnPairs)})`;
  }

  protected setSearchQuery(search: FilterType, options: SearchOptionsType): QueryQuerierInterface {
    if (search.select) {
      if (isString(search.select) || isBoolean(search.select)) {
        options.instance.select.column('*');
      } else {
        this.setSelectQuery(search, options);
      }
    }

    if (options?.schema) {
      options.instance.from.table(options?.schema.table, options.alias);
    }

    if (search.where) {
      this.setWhereQuery(search, options);
    }

    if (search.order) {
      this.setOrderQuery(search, options);
    }

    return options.query;
  }

  protected setSelectQuery(search: FilterType, options: SearchOptionsType): void {
    if (options.schema && search.select) {
      const localTable = options.alias;

      const localColumns = [];
      const localRelations = [];

      for (const [property, value] of Object.entries(search.select)) {
        if (isFilter(value)) localRelations.push([property, value]);
        else localColumns.push([property, value]);
      }

      // @TODO work on typecasting the value
      for (const [property, _value] of localColumns) {
        const propertyName = this.repository.options.toTableNaming(property);
        const columnName = `${localTable}.${propertyName}`;
        options.instance.select.column(columnName, propertyName);
        options.returns?.push(propertyName);
        if (localRelations) options.instance.group.column(columnName);
      }

      let relationTableAlias = options.alias;

      for (const [property, value] of localRelations) {
        const withRelation = options.schema.relations.find((relation) => {
          return relation.key == property;
        });

        if (withRelation) {
          const propertyName = this.repository.options.toTableNaming(property as string);
          relationTableAlias = Text.getNextLetter(relationTableAlias);

          if (!withRelation) throw new Error('DEFAULT no relation found');

          let relationFilter: FilterType = {};
          // @ts-ignore whe can have a filter with value type as boolean
          if (value === true) {
            relationFilter = value;
            if (withRelation.annotation.options?.filter) {
              relationFilter = withRelation.annotation.options?.filter;
              if (!relationFilter.select) relationFilter.select = '*';
            }
          } else {
            if (isFilter(value)) {
              relationFilter = value;
            }
          }

          const relationName = withRelation.annotation.name;
          const relationArtifact = withRelation.annotation.referenceTable();
          const relationDecorator = DecoratorMetadata.findByAnnotationInteroperableName(relationArtifact, 'Schema');

          if (!relationDecorator) throw new Error('DEFAULT schema annotation not found');

          const relationSchema = relationDecorator.annotation.target as SchemaAnnotation;
          const relationTable = relationSchema.table;
          const relationJoinType = withRelation.annotation.options?.type || 'left';

          let localProperty = '';
          let relationProperty = '';

          if (withRelation.annotation.options?.foreignKey) {
            const foreignDecorator = relationSchema?.foreignKeys.find((annotation) =>
              annotation.key == withRelation.annotation.options?.foreignKey
            );
            if (!foreignDecorator) throw new Error('DEFAULT foreignDecorator not found');

            localProperty = foreignDecorator.annotation.options.referenceKey as string;
            relationProperty = withRelation.annotation.options.foreignKey as string;
          }

          if (withRelation.annotation.options?.localKey) {
            const foreignDecorator = options.schema.foreignKeys.find((annotation) =>
              annotation.key == withRelation.annotation.options?.localKey
            );
            if (!foreignDecorator) throw new Error('DEFAULT foreignDecorator not found');

            relationProperty = foreignDecorator.annotation.options.referenceKey as string;
            localProperty = withRelation.annotation.options?.localKey as string;
          }

          localProperty = this.repository.options.toTableNaming(localProperty);
          relationProperty = this.repository.options.toTableNaming(relationProperty);

          const referenceColumnPairs: any = [];

          const relationPrimaryKeyDecorator = relationSchema?.columns.find((column) => {
            return column.annotation.options?.primary;
          });
          if (!relationPrimaryKeyDecorator) throw new Error('DEFAULT relationPrimaryKeyDecorator not found');

          if (relationFilter.select && relationFilter.select != '*') {
            for (const [referenceProperty, referenceValue] of Object.entries(relationFilter.select)) {
              if (!isFilter(referenceValue)) {
                const referenceKey = this.repository.options.toTableNaming(referenceProperty);
                referenceColumnPairs.push(`'${referenceKey}'`, `${relationTableAlias}.${referenceKey}`);
              }
            }
          } else {
            for (const column of relationSchema.columns) {
              const referenceKey = this.repository.options.toTableNaming(column.key);
              referenceColumnPairs.push(`'${referenceKey}'`, `${relationTableAlias}.${referenceKey}`);
            }
          }

          const join = options.query[relationJoinType];

          const hasRelations = Object.entries(relationFilter?.select || {}).filter(([_key, value]) => isFilter(value));

          if (relationFilter.where || relationFilter.order || hasRelations.length > 0) {
            join.table(relationTableAlias, (query: QueryQuerierInterface) => {
              const opts = this.getQueryOptions({ alias: options?.alias, query, schema: relationSchema });
              const columnName = `${opts.alias}.${relationProperty}`;

              if (relationFilter.select != '*') {
                opts.instance.select.column(columnName, relationProperty);
                opts.instance.group.column(columnName);
              }
              opts.returns?.push(relationProperty);
              for (const [key, _value] of hasRelations) {
                const referenceKey = this.repository.options.toTableNaming(key);
                referenceColumnPairs.push(`'${referenceKey}'`, `${opts?.alias}.${referenceKey}`);
              }

              return this.setSearchQuery(relationFilter, opts);
            });
          } else {
            join.table(relationTable, relationTableAlias);
          }

          const jsonFilter = { key: '', value: '' };
          if (relationName == 'Many') {
            jsonFilter.key = `FILTER (WHERE ${relationTableAlias}.${relationPrimaryKeyDecorator
              .key as string} IS NOT NULL)`, jsonFilter.value = `'[]'::json`;
            options.instance.select.column(
              propertyName,
              new Raw(this.toJsonAggregate(referenceColumnPairs, jsonFilter)),
            );
          }

          if (relationName == 'One') {
            options.instance.select.column(propertyName, new Raw(`to_json(${relationTableAlias})`));
            options.instance.group.column(`${relationTableAlias}.*`);
          }

          join.on.and(new Raw(`${localTable}.${localProperty} = ${relationTableAlias}.${relationProperty}`));
        }
      }
    }
  }

  protected setWhereQuery(search: FilterType, options: Partial<SearchOptionsType>): void {
    if (search.where && options.instance) {
      for (const [condition, entities] of Objector.getEntries(search.where)) {
        for (const entity of entities) {
          if (!entity.and && !entity.or) {
            for (const [property, operation] of Object.entries(entity)) {
              for (const [operator, value] of Object.entries(operation as any)) {
                let withAlias = property;
                if (options?.alias && !property.includes('.')) withAlias = `${options?.alias}.${property}`;
                options.instance.where.and(
                  this.repository.options.toTableNaming(withAlias),
                  operator as any,
                  value as any,
                );
              }
            }
          } else {
            options.query?.where[condition]((query: QueryQuerierInterface) => {
              this.setWhereQuery({ where: entity }, { ...this.getQueryOptions({ query }), alias: options.alias || '' });
              return query;
            });
          }
        }
      }
    }
  }
  protected setOrderQuery(filter: FilterType, options: SearchOptionsType): void {
    for (const [property, direction] of Object.entries(filter?.order || {})) {
      const tablePropertyKey = this.repository.options.toTableNaming(property);
      let withAlias = `${options.schema?.table}.${tablePropertyKey}`;
      if (options?.alias && !property.includes('.')) withAlias = `${options?.alias}.${tablePropertyKey}`;

      if (filter?.select) {
        if (isString(filter?.select) || !filter?.select[property]) {
          options.instance.group.column(withAlias);
        }
      }

      options.instance.order[direction](withAlias);
    }
  }

  public searchExecute(
    search: FilterType,
    options?: SearchOptionsType,
  ): Promise<Array<ExecuteResultType<InstanceType<T>>>> {
    return this.repository.execute([this.searchQuery(search, options)], options);
  }

  public search(search: FilterType, options?: SearchOptionsType): Promise<Array<InstanceType<T>>> {
    return this.searchExecute(search, options).then((results) => {
      return results[0].rows;
    });
  }

  public searchFirst(search: FilterType, options?: SearchOptionsType): Promise<InstanceType<T>> {
    return this.searchExecute(search, options).then((results) => {
      return results[0].rows[0];
    });
  }
}

export default Query;
