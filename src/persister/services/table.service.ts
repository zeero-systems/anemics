import type { QueryType } from '~/querier/types.ts';
import type { RepositoryInterface, RepositoryTableInterface } from '~/persister/interfaces.ts';
import type { ExecuteResultType } from '~/persister/types.ts';
import type { NewableType } from '@zeero/commons';

import { DecoratorMetadata, isClass } from '@zeero/commons';

import SchemaAnnotation from '~/persister/annotations/schema.annotation.ts';
import isRelation from '~/persister/guards/is-foreign-key.guard.ts';

class Table<T extends NewableType<T>> implements RepositoryTableInterface<T> {
  constructor(public repository: RepositoryInterface<T>) {}

  public createQuery(): Array<QueryType> {
    const queriers = [];

    if (this.repository.annotation) {
      const localTable = this.repository.annotation.table;

      const queryTable = this.repository.querier
        .table.create.name(localTable).notExists();

      for (const decoration of this.repository.annotation.columns) {
        const column = queryTable.column.name(this.repository.options.toTableNaming(decoration.key)) as any;

        column.type(decoration.annotation.type, decoration.annotation.options);

        if (decoration.annotation.options?.primaryKey) column.primaryKey();
        if (decoration.annotation.options?.nullable === false) column.notNull();
        if (decoration.annotation.options?.unique) column.unique();
      }

      for (const decoration of this.repository.annotation.foreignKeys) {
        if (isRelation(decoration.annotation)) {
          let referenceTable = '';
          if (isClass(decoration.annotation.referenceTable)) {
            const referenceDecorator = DecoratorMetadata.findByAnnotationInteroperableName(
              this.repository.schema,
              'Schema',
            );

            if (referenceDecorator) {
              const referenceSchema: SchemaAnnotation = referenceDecorator.annotation.target as any;

              referenceTable = referenceSchema.table;
            }
          }

          if (!referenceTable) {
            referenceTable = decoration.annotation.referenceTable as string;
          }

          const name = decoration.annotation.options.constraintName || `fk_${localTable}_${referenceTable}`;

          let foreignKey = decoration.annotation.options.foreignKey;
          if (!foreignKey) {
            foreignKey = this.repository.options.toTableNaming(decoration.key);
          }

          const constraint = queryTable.constraint.name(name).foreignKey(foreignKey);

          constraint.references(referenceTable, { column: decoration.annotation.options.referenceKey });

          if (decoration.annotation.options.onUpdate) {
            constraint.onUpdate(decoration.annotation.options.onUpdate);
          }

          if (decoration.annotation.options.onDelete) {
            constraint.onDelete(decoration.annotation.options.onDelete);
          }
        }
      }

      queriers.push(queryTable.toQuery());

      for (const decoration of this.repository.annotation.indexes) {
        const columnName = this.repository.options.toTableNaming(decoration.key);
        const indexName = decoration.annotation.indexName || `idx_${columnName}`;

        const queryIndex = this.repository.querier
          .index.create.name(indexName).on.table(localTable);

        if (decoration.annotation.options?.type) {
          queryIndex.using.type(decoration.annotation.options?.type);
        }

        queryIndex.with.column(columnName);

        queriers.push(queryIndex.toQuery());
      }
    }

    return queriers;
  }

  public createExecute(): Promise<Array<ExecuteResultType<InstanceType<T>>>> {
    return this.repository.execute(this.createQuery());
  }

  public create(): Promise<InstanceType<T>> {
    return this.createExecute().then((results) => {
      return results[0].rows[0];
    });
  }

  public drop(action?: 'cascade' | 'restrict'): Promise<boolean> {
    return this.dropExecute(action).then((results) => {
      return !results[0].rows[0];
    });
  }

  public dropQuery(action?: 'cascade' | 'restrict'): Array<QueryType> {
    const query = this.repository.querier.table;
    const drop = query.drop;

    if (this.repository.annotation) {
      drop.name(this.repository.annotation.table).exists();

      if (action == 'cascade') drop.cascade();
    }

    return [query.toQuery()];
  }

  public dropExecute(action?: 'cascade' | 'restrict'): Promise<Array<ExecuteResultType<InstanceType<T>>>> {
    return this.repository.execute(this.dropQuery(action));
  }
}

export default Table;
