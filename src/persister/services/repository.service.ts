import type { RecordInterface, RepositoryInterface, TableInterface } from '~/persister/interfaces.ts';
import type { DatabaseInterface, SchemaInterface } from '~/storer/interfaces.ts';
import type { QuerierOptionsType } from '~/querier/types.ts';
import type { QuerierInterface } from '~/querier/interfaces.ts';
import type { ExecuteOptionsType, RepositoryOptionsType } from '~/persister/types.ts';
import type { ExecuteResultType } from '~/storer/types.ts';
import type { AnnotationInterface, NewableType } from '@zeero/commons';

import { DecoratorMetadata, Text } from '@zeero/commons';
import Querier from '~/querier/services/querier.service.ts';
import SchemaAnnotation from '~/storer/annotations/schema.annotation.ts';
import Record from '~/persister/services/record.service.ts';
import Table from '~/persister/services/table.service.ts';

export class Repository<T extends NewableType<T>> implements RepositoryInterface<T> {
  public types: string[] = [
    'Character',
    'Date',
    'Geometric',
    'Language',
    'Network',
    'Numeric',
    'Range',
    'Structure'
  ]

  public table: TableInterface<T>
  public record: RecordInterface<T>
  public querier: QuerierInterface
  public annotation!: AnnotationInterface & SchemaInterface
  
  constructor(
    public schema: T,
    public database: DatabaseInterface,
    public options: RepositoryOptionsType = { 
      toSchemaNaming: Text.toCamelcase,
      toTableNaming: Text.toSnakecase
    }
  ) {
    this.record = new Record(this)
    this.table = new Table(this)
    this.querier = new Querier({
      text: '',
      placeholder: database.common.placeholder,
      placeholderType: database.common.placeholderType 
    })

    const decorator = DecoratorMetadata.findByAnnotationInteroperableName(this.schema, 'Schema')
    if (decorator) {
      this.annotation = decorator.annotation.target as any
      if (this.annotation?.options?.naming) {
        this.options.toSchemaNaming = this.annotation?.options.naming
      }
    }
  }

  public execute(queriers: QuerierOptionsType[], options?: ExecuteOptionsType): Promise<ExecuteResultType<InstanceType<T>>[]> {
    if (options?.connection == 'transaction') return this.executeWithTransaction(queriers, options)
    return this.executeWithConnect(queriers, options)
  }

  public executeWithConnect(queriers: QuerierOptionsType[], _options?: ExecuteOptionsType): Promise<ExecuteResultType<InstanceType<T>>[]> {
    return this.database.connection().then(async (connection) => {
      await connection.connect()
      
      const result = await Promise.all(queriers.map((querier) => {
        let fields

        if (querier.columnNames && querier.columnNames.length > 0) {
          fields = querier.columnNames?.map(this.options.toSchemaNaming)
        }

        console.log(querier)

        const options = { args: querier.args, fields }
        return connection.execute<InstanceType<T>>(querier.text, options)
      }))

      await connection.disconnect()
      
      return result
    })
  }

  public executeWithTransaction(queriers: QuerierOptionsType[], options?: ExecuteOptionsType): Promise<ExecuteResultType<InstanceType<T>>[]> {
    return this.database.connection().then(async (connection) => {
      await connection.connect()

      const transaction = connection.transaction(`${Date.now()}`, options?.transaction)

      await transaction.begin()
      
      const result = await Promise.all(queriers.map((querier) => {
        let fields

        if (querier.columnNames && querier.columnNames.length > 0) {
          fields = querier.columnNames?.map(this.options.toSchemaNaming)
        }

        const options = { args: querier.args, fields }
        return transaction.execute<InstanceType<T>>(querier.text, options)
      }))

      await transaction.commit()

      await transaction.release()

      await connection.disconnect()
      
      return result
    })
  }
}

export default Repository
