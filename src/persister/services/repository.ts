import type { AnnotationInterface, NewableType } from '@zeero/commons';
import type { QueryType } from '~/querier/types.ts';
import type { QuerierInterface } from '~/querier/interfaces.ts';
import type {
  ExecuteOptionsType,
  ExecuteResultType,
  RepositoryExecuteOptionsType,
  RepositoryOptionsType,
} from '~/persister/types.ts';
import type {
  DatabaseInterface,
  RepositoryInterface,
  RepositoryQueryInterface,
  RepositoryTableInterface,
  SchemaInterface,
} from '~/persister/interfaces.ts';

import { DecoratorMetadata, Text } from '@zeero/commons';
import Query from '~/persister/services/query.service.ts';
import Table from '~/persister/services/table.service.ts';
import Querier from '~/querier/services/querier.service.ts';

export class Repository<T extends NewableType<T>> implements RepositoryInterface<T> {
  public types: string[] = [
    'Character',
    'Date',
    'Geometric',
    'Language',
    'Network',
    'Numeric',
    'Range',
    'Structure',
  ];

  public annotation!: AnnotationInterface & SchemaInterface;
  public querier: QuerierInterface;
  public query: RepositoryQueryInterface<T>;
  public table: RepositoryTableInterface<T>;

  constructor(
    public schema: T,
    public database: DatabaseInterface,
    public options: RepositoryOptionsType = {
      toSchemaNaming: Text.toCamelcase,
      toTableNaming: Text.toSnakecase,
    },
  ) {
    this.table = new Table(this);
    this.query = new Query(this);
    this.querier = new Querier({ syntax: this.database.common.syntax });

    const decorator = DecoratorMetadata.findByAnnotationInteroperableName(this.schema, 'Schema');
    if (decorator) {
      this.annotation = decorator.annotation.target as any;
      if (this.annotation?.options?.naming) {
        this.options.toSchemaNaming = this.annotation?.options.naming;
      }
    }
  }

  public execute(
    queriers: QueryType[],
    options?: RepositoryExecuteOptionsType,
  ): Promise<ExecuteResultType<InstanceType<T>>[]> {
    if (options?.connection == 'transaction') return this.executeWithTransaction(queriers, options);
    return this.executeWithConnect(queriers, options);
  }

  public async executeWithConnect(
    queriers: QueryType[],
    _options?: ExecuteOptionsType,
  ): Promise<ExecuteResultType<InstanceType<T>>[]> {
    await using connection = await this.database.connection();
    await connection.connect();

    const result = await Promise.all(queriers.map((querier) => {
      let fields;

      if (querier.returns && querier.returns.length > 0) {
        fields = querier.returns?.map(this.options.toSchemaNaming);
      }

      const options = { args: querier.args, fields };

      return connection.execute<InstanceType<T>>(querier.text, options);
    }));

    return result;
  }

  public async executeWithTransaction(
    queriers: QueryType[],
    options?: RepositoryExecuteOptionsType,
  ): Promise<ExecuteResultType<InstanceType<T>>[]> {
    await using connection = await this.database.connection();
    await connection.connect();

    await using transaction = connection.transaction(`${Date.now()}`, options?.transaction);
    await transaction.begin();

    const result = await Promise.all(queriers.map((querier) => {
      let fields;

      if (querier.returns && querier.returns.length > 0) {
        fields = querier.returns?.map(this.options.toSchemaNaming);
      }

      const options = { args: querier.args, fields };
      return transaction.execute<InstanceType<T>>(querier.text, options);
    }));

    await transaction.commit();

    return result;
  }
}

export default Repository;
