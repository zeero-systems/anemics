import type { QuerierOptionsType } from '~/querier/types.ts';
import type { RepositoryInterface, TableInterface } from '~/persister/interfaces.ts';
import type { ExecuteResultType } from '~/storer/types.ts';
import type { NewableType } from '@zeero/commons';

import { DecoratorMetadata, isClass } from '@zeero/commons';

import SchemaAnnotation from '~/storer/annotations/schema.annotation.ts';
import isRelation from '../../storer/guards/is-foreign-key.guard.ts';

class Table<T extends NewableType<T>> implements TableInterface<T> {
  constructor(public repository: RepositoryInterface<T>) { }

  public createQuery(): Array<QuerierOptionsType> {
    const queriers = []

    if (this.repository.annotation) {
      const localTable = this.repository.annotation.table

      const queryTable = this.repository.querier
        .table.create.name(localTable).ifNotExists()
    
      for (const decoration of this.repository.annotation.columns) {
        const column = queryTable.column.name(this.repository.options.toTableNaming(decoration.key))
          [decoration.annotation.name.toLowerCase()](decoration.annotation.type, decoration.annotation.options)
      
        if (decoration.annotation.options?.primary) column.primary()
        if (decoration.annotation.options?.default) column.default(decoration.annotation.options.default)
        if (decoration.annotation.options?.collation) column.collation(decoration.annotation.options.collation)
        if (decoration.annotation.options?.nullable) column.nullable(decoration.annotation.options.nullable)
        if (decoration.annotation.options?.unique) column.unique()
      }

      for (const decoration of this.repository.annotation.foreignKeys) {
        if (isRelation(decoration.annotation)) {

          let referenceTable = ''
          if (isClass(decoration.annotation.referenceTable)) {
            const referenceDecorator = DecoratorMetadata.findByAnnotationInteroperableName(this.repository.schema, 'Schema')

            if (referenceDecorator) {
              const referenceSchema: SchemaAnnotation = referenceDecorator.annotation.target as any

              referenceTable = referenceSchema.table
            }
          }

          if (!referenceTable) {
            referenceTable = decoration.annotation.referenceTable as string
          }

          const name = decoration.annotation.options.constraintName || `fk_${localTable}_${referenceTable}`
          
          let foreignKey = decoration.annotation.options.foreignKey
          if (!foreignKey) {
            foreignKey = this.repository.options.toTableNaming(decoration.key)
          }

          const constraint = queryTable.constraint.name(name).foreingKey(foreignKey)

          constraint.references(referenceTable, { field: decoration.annotation.options.referenceKey })

          if (decoration.annotation.options.onUpdate) {
            constraint.onUpdate(decoration.annotation.options.onUpdate)
          }

          if (decoration.annotation.options.onDelete) {
            constraint.onDelete(decoration.annotation.options.onDelete)
          }
        }
      }

      queriers.push(queryTable.toQuery())

      for (const decoration of this.repository.annotation.indexes) {
        const columnName = this.repository.options.toTableNaming(decoration.key)
        const indexName = decoration.annotation.indexName || `idx_${columnName}`

        const queryIndex = this.repository.querier
          .index.create.name(indexName).on.table(localTable)
        
        if (decoration.annotation.options?.type) {
          queryIndex.using.type(decoration.annotation.options?.type)
        }

        queryIndex.with.column(columnName)
        
        queriers.push(queryIndex.toQuery())
      }
    
    }

    return queriers
  }

  public createExecute(): Promise<Array<ExecuteResultType<InstanceType<T>>>> {
    return this.repository.execute(this.createQuery())
  }

  public create(): Promise<InstanceType<T>> {
    return this.createExecute().then((results) => {
      return results[0].rows[0]
    })
  }

  public drop(action?: 'cascade' | 'restrict'): Promise<boolean> {
    return this.dropExecute(action).then((results) => {
      return !results[0].rows[0]
    })
  }

  public dropQuery(action?: 'cascade' | 'restrict'): Array<QuerierOptionsType> {
    const query = this.repository.querier.table

    if (this.repository.annotation) {
      query.drop.name(this.repository.annotation.table).ifExists()

      if (action == 'cascade') query.cascade()
      if (action == 'restrict') query.restrict()
    }

    return [query.toQuery()]
  }

  public dropExecute(action?: 'cascade' | 'restrict'): Promise<Array<ExecuteResultType<InstanceType<T>>>> {
    return this.repository.execute(this.dropQuery(action))
  }
}

export default Table
