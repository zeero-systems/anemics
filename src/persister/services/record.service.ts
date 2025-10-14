import type { QuerierOptionsType, FilterPredicateType, FilterSelectType, FilterType, FilterOrderType } from '~/querier/types.ts';
import type { RepositoryInterface, RecordInterface } from '~/persister/interfaces.ts';
import type { ActionOptionsType } from '~/persister/types.ts';
import type { ExecuteResultType } from '~/storer/types.ts';
import type { EntryInterface, OrderInterface, PredicateInterface, SelectInterface } from '~/querier/interfaces.ts';
import { DecoratorMetadata, DecoratorType, isString, PropertyType, type NewableType } from '@zeero/commons';

import isFilterPredicate from '../guards/is-filter-predicate.guard.ts';
import Rawwer from '../../querier/services/clauses/rawwer.service.ts';
import Raw from '../../querier/services/clauses/raw.service.ts';
import isFilter from '../guards/is-filter.guard.ts';
import isColumn from '../../storer/guards/is-columns.guard.ts';
import isSchema from '../../storer/guards/is-schema.guard.ts';
import SchemaAnnotation from '../../storer/annotations/schema.annotation.ts';

export class Record<T extends NewableType<T>> implements RecordInterface<T> {
  constructor(public repository: RepositoryInterface<T>) { }

  public createQuery(records: Array<InstanceType<T>>, options?: ActionOptionsType): Array<QuerierOptionsType> {
    const queriers = []
    
    if (this.repository.annotation) {
      for (const record of records) {
        const entity = record as any
        const query = this.repository.querier.entry
        const insert = query.insert
        
        insert.table(this.repository.annotation.table)

        for (const decoration of this.repository.annotation.columns) {
          const propertyKey = String(decoration.key)
          const transformedPropertyKey = this.repository.options.toTableNaming(decoration.key)
          if (typeof entity[propertyKey] !== 'undefined') {
            insert.column(transformedPropertyKey, entity[propertyKey])
          }
          if (!options?.returning || options.returning.includes(propertyKey)) {
            insert.returning(transformedPropertyKey)
          }
        }

        queriers.push(query.toQuery())
      }
    }

    return queriers
  }

  public createExecute(records: Array<InstanceType<T>>, options?: ActionOptionsType): Promise<Array<ExecuteResultType<InstanceType<T>>>> {
    return this.repository.execute(this.createQuery(records, options), options)
  }

  public create(record: InstanceType<T>, options?: ActionOptionsType): Promise<InstanceType<T>> {
    return this.createExecute([record], options).then((results) => {
      return results[0].rows[0]
    })
  }

  public createMany(records: Array<InstanceType<T>>, options?: ActionOptionsType): Promise<Array<InstanceType<T>>> {
    return this.createExecute(records, options).then((results) => {
      return results.reduce((a, b) => {
        a.push(...b.rows)
        return a
      }, [] as any)
    })
  }

  public updateQuery(records: Array<Partial<InstanceType<T>>>, options?: ActionOptionsType): Array<QuerierOptionsType> {
    const queriers = []
    
    if (this.repository.annotation) {
      const primaryColumn = this.repository.annotation.columns.find((column) => column.annotation.options?.primary)

      if (primaryColumn) {
        for (const record of records) {
          const entity = record as any
          const query = this.repository.querier.entry
          const update = query.update.table(this.repository.annotation.table)
    
          for (const decoration of this.repository.annotation.columns) {
            const propertyKey = String(decoration.key)
            const transformedPropertyKey = this.repository.options.toTableNaming(decoration.key)

            if (propertyKey != primaryColumn.key) {
              if (typeof entity[propertyKey] !== 'undefined') {
                update.column(transformedPropertyKey, entity[propertyKey])
              }
              if (!options?.returning || options.returning.includes(propertyKey)) {
                update.returning(transformedPropertyKey)
              }
            } else {
              query.where.and(propertyKey, 'eq', entity[propertyKey])
              update.returning(transformedPropertyKey)
            }

          } 
          queriers.push(query.toQuery())
    
        }
      }      
    }

    return queriers
  }

  public updateExecute(records: Array<Partial<InstanceType<T>>>, options?: ActionOptionsType): Promise<Array<ExecuteResultType<InstanceType<T>>>> {
    return this.repository.execute(this.updateQuery(records, options), options)
  }

  public update(record: Partial<InstanceType<T>>, options?: ActionOptionsType): Promise<InstanceType<T>> {
    return this.updateExecute([record], options).then((results) => {
      return results[0].rows[0]
    })
  }

  public updateMany(records: Array<InstanceType<T>>, options?: ActionOptionsType): Promise<Array<InstanceType<T>>> {
    return this.updateExecute(records, options).then((results) => {
      return results.reduce((a, b) => {
        a.push(...b.rows)
        return a
      }, [] as any)
    })
  }

  public deleteQuery(where: FilterPredicateType, options?: ActionOptionsType): QuerierOptionsType {
    const querierEntry =  this.repository.querier.entry
  
    if (this.repository.annotation) {
      querierEntry.delete.table(this.repository.annotation.table)
    }

    this.setWhereQuery(querierEntry.where, where)

    if (options?.returning) {
      for (const column of options?.returning) {
        querierEntry.delete.returning(column)
      }
    }

    return querierEntry.toQuery()
  }

  public deleteExecute(where: FilterPredicateType, options?: ActionOptionsType): Promise<Array<ExecuteResultType<InstanceType<T>>>> {
    return this.repository.execute([this.deleteQuery(where, options)], options)
  }

  public delete(query: FilterPredicateType | InstanceType<T>, options?: ActionOptionsType): Promise<InstanceType<T>> {
    let where: FilterPredicateType = {}
    if (!isFilterPredicate(query)) {
      if (this.repository.annotation) {
        const primaryColumn = this.repository.annotation.columns.find((column) => column.annotation.options?.primary)

        if (primaryColumn) {
          where = { and: [ { [primaryColumn.key]: { eq: (query as any)[primaryColumn.key] } }] }
        }
      }      
    } else {
      where = query
    }
    
    return this.deleteExecute(where, options).then((results) => {
      const lastResultIndex = results.length-1
      const lastRowIndex = results[lastResultIndex]?.rows.length-1
      return results[lastResultIndex].rows[lastRowIndex]
    })
  }

  public deleteMany(queries: Array<FilterPredicateType | InstanceType<T>>, options?: ActionOptionsType): Promise<Array<InstanceType<T>>> {
    const where: FilterPredicateType = { or: [] }

    for (const query of queries) {
      if (!isFilterPredicate(query)) {
        if (this.repository.annotation) {
          const primaryColumn = this.repository.annotation.columns.find((column) => column.annotation.options?.primary)
  
          if (primaryColumn) {
            where.or?.push({ and: [ { [primaryColumn.key]: { eq: (query as any)[primaryColumn.key] } }] })
          }
        }      
      } else {
        where.or?.push(query)
      }
    }

    return this.deleteExecute(where, options).then((results) => {
      return results[0].rows
    })
  }
  
  public searchQuery(search: FilterType, options?: ActionOptionsType & { entry?: EntryInterface, schema?: SchemaAnnotation }): QuerierOptionsType {
    const entry = options?.entry ?? this.repository.querier.entry;
    const schema = this.repository.annotation;
    return this.setSearchQuery(search, { ...options, entry, schema }).toQuery();
  }

  protected toJsonAggregate(columnPairs: Array<string>, filter: any = { key: '', value: '' }): string {
    if (filter.key) return `COALESCE (json_agg(json_build_object(${columnPairs.join(', ')})) ${filter.key}, ${filter.value})`
    return `json_agg(json_build_object(${columnPairs.join(', ')}))`
  }

  protected setSearchQuery(search: FilterType, options?: ActionOptionsType & { entry: EntryInterface, schema: SchemaAnnotation }): EntryInterface {
    const querierEntry =  options?.entry || this.repository.querier.entry

    if (search.select) {
      if (isString(search.select)) {
        querierEntry.select.column('*')
      } else {
        this.setSelectQuery(querierEntry, search.select, options?.schema)
      }
    }
    
    // @TODO make this mandatory and thrownable from the repository
    if(options?.schema) {
      querierEntry.from.table(options?.schema.table)
    }

    if (search.where) {
      this.setWhereQuery(querierEntry.where, search.where)
    }

    if (search.order) {
      this.setOrderQuery(querierEntry, search, options?.schema)
    }

    return querierEntry
  }

  protected setSelectQuery(querier: EntryInterface, selectFilter: FilterSelectType, annotation?: SchemaAnnotation): void {
    
    if (annotation) {
      const localTable = annotation.table
      const select = querier.select
      const group = querier.group
      
      const localColumns = []
      const localRelations = []

      for (const [property, value] of Object.entries(selectFilter)) {
        if (isFilter(value)) localRelations.push([property, value])
        else localColumns.push([property, value])
      }

      // @TODO work on typecasting the value
      for (const [property, _value] of localColumns) {
        const propertyName = this.repository.options.toTableNaming(property)
        const columnName = `${localTable}.${propertyName}`
        select.column(columnName, propertyName)
        if (localRelations) group.column(columnName)
      }

      for (const [property, value] of localRelations) {
        const propertyName = this.repository.options.toTableNaming(property as string)
        console.log('property', propertyName)
        
        const withRelation = annotation.relations.find((relation) => {
          return relation.key == property
        })

        if (!withRelation) throw new Error("DEFAULT no relation found");
        
        let relationFilter: FilterType = {}
        if (isFilter(value)) relationFilter = value

        const relationName = withRelation.annotation.name
        console.log('relationName', relationName)
        const relationArtifact = withRelation.annotation.referenceTable()
        const relationDecorator = DecoratorMetadata.findByAnnotationInteroperableName(relationArtifact, 'Schema')

        if (!relationDecorator) throw new Error("DEFAULT schema annotation not found");

        const relationSchema = relationDecorator.annotation.target as SchemaAnnotation
        const relationTable = relationSchema.table
        const relationJoinType = withRelation.annotation.options?.type || 'left'

        let localProperty = ''
        let relationProperty = ''

        if (withRelation.annotation.options?.foreignKey) {

          const foreignDecorator = relationSchema?.foreignKeys.find((annotation) => annotation.key == withRelation.annotation.options?.foreignKey)
          if (!foreignDecorator) throw new Error('DEFAULT foreignDecorator not found')
          
          localProperty = foreignDecorator.annotation.options.referenceKey as string
          relationProperty = withRelation.annotation.options.foreignKey as string
        }

        if (withRelation.annotation.options?.localKey) {
          const foreignDecorator = annotation.foreignKeys.find((annotation) => annotation.key == withRelation.annotation.options?.localKey)
          if (!foreignDecorator) throw new Error('DEFAULT foreignDecorator not found')
          
          relationProperty = foreignDecorator.annotation.options.referenceKey as string
          localProperty = withRelation.annotation.options?.localKey as string
        }

        localProperty = this.repository.options.toTableNaming(localProperty)
        relationProperty = this.repository.options.toTableNaming(relationProperty)
        
        const referenceColumnPairs: any = []

        const relationPrimaryKeyDecorator = relationSchema?.columns.find((column) => {
          return column.annotation.options?.primary
        })
        if (!relationPrimaryKeyDecorator) throw new Error("DEFAULT relationPrimaryKeyDecorator not found");

        if (relationFilter.select && relationFilter.select != '*') {
          for (const [referenceProperty, referenceValue] of Object.entries(relationFilter.select)) {
            if (!isFilter(referenceValue)) {
              const referenceKey = this.repository.options.toTableNaming(referenceProperty)
              referenceColumnPairs.push(`'${referenceKey}'`, `${relationTable}.${referenceKey}`)
            }
          }
        } else {
          for (const column of relationSchema.columns) {
            const referenceKey = this.repository.options.toTableNaming(column.key)
            referenceColumnPairs.push(`'${referenceKey}'`, `${relationTable}.${referenceKey}`)
          }
        }
        
        const join = querier[relationJoinType]

        console.log('join', relationJoinType, relationTable)

        // @TODO add limit to querier to get only one on ONE annotation
        const jsonFilter = { key: '', value: '' }
        if (relationName == 'Many') {
          jsonFilter.key = `FILTER (WHERE ${relationTable}.${relationPrimaryKeyDecorator.key as string} IS NOT NULL)`,
          jsonFilter.value = `'[]'::json`
        }

        const hasRelations = Object.entries(relationFilter?.select || {}).filter(([key, value]) => isFilter(value))

        if (relationFilter.where || relationFilter.order || hasRelations.length > 0) {
          join.table(relationTable, (entry: EntryInterface) => {
            const columnName = `${relationTable}.${relationProperty}`
            entry.select.column(columnName, relationProperty)
            entry.group.column(columnName)

            for (const [key, _value] of hasRelations) {
              const referenceKey = this.repository.options.toTableNaming(key)
              referenceColumnPairs.push(`'${referenceKey}'`, `${relationTable}.${referenceKey}`)
            }

            return this.setSearchQuery(relationFilter, { entry, schema: relationSchema })
          })
        } else {
          join.table(relationTable)
        }

        select.column(propertyName, new Raw(this.toJsonAggregate(referenceColumnPairs, jsonFilter)))

        join.on.and(new Raw(`${localTable}.${localProperty} = ${relationTable}.${relationProperty}`))
      }
    }
  }

  protected setWhereQuery(where: PredicateInterface, search: FilterPredicateType): void {
    for (const [condition, entities] of Object.entries(search)) {
      for (const entity of entities) {
        where[condition]((query: EntryInterface) => {
          this.setEntityWhereQuery(query.where, entity)
          return query
        })
      }
    }
  }

  protected setEntityWhereQuery(where: PredicateInterface, entity: any) {
    if (!entity.and && !entity.or) {
      for (const [property, operation] of Object.entries(entity)) {
        for (const [operator, value] of Object.entries(operation as any)) {
          where.and(this.repository.options.toTableNaming(property), operator as any, value as any)
        }
      }
    } else {
      this.setWhereQuery(where, entity)
    }
  }

  protected setOrderQuery(entry: EntryInterface, filter: FilterType, annotation?: SchemaAnnotation): void {
    for (const [property, direction] of Object.entries(filter?.order || {})) {
      const tablePropertyKey = this.repository.options.toTableNaming(property)
      const columName = `${annotation?.table}.${tablePropertyKey}`

      if (filter?.select) {
        if (isString(filter?.select) || !filter?.select[property]) {
          entry.group.column(columName)
        }
      }

      entry.order[direction](columName)
    }
  }
  
  public searchExecute(search: FilterType, options?: ActionOptionsType & { entry: EntryInterface }): Promise<Array<ExecuteResultType<InstanceType<T>>>> {
    return this.repository.execute([this.searchQuery(search, options)], options)
  }

  public search(search: FilterType, options?: ActionOptionsType & { entry: EntryInterface }): Promise<Array<InstanceType<T>>> {
    return this.searchExecute(search, options).then((results) => {
      return results[0].rows
    })
  }

  public searchFirst(search: FilterType, options?: ActionOptionsType & { entry: EntryInterface }): Promise<InstanceType<T>> {
    return this.searchExecute(search, options).then((results) => {
      return results[0].rows[0]
    })
  }
}

export default Record
