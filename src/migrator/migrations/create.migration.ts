import type { SpanInterface } from '@zeero/commons';
import type { MigrationInterface } from '~/migrator/interfaces.ts';
import type { MigratorOptionsType } from '~/migrator/types.ts';
import type { QuerierInterface } from '~/querier/interfaces.ts';
import type { TransactionInterface } from '~/persister/interfaces.ts';

import { StatusEnum } from '@zeero/commons';

export class CreateMigration implements MigrationInterface {
  persist = true;

  constructor(
    public span: SpanInterface,
    public querier: QuerierInterface,
    public transaction: TransactionInterface,
    public options: MigratorOptionsType,
  ) {}

  async up(): Promise<void> {
    const table = this.querier.table
      .create.name(`${this.options.tableSchema}.${this.options.tableName}`).notExists()
      .column.name('id').type('serial').primaryKey().notNull().unique()
      .column.name('action').type('varchar', { length: 20 }).notNull().default('migration') // migration or seed
      .column.name('environment').type('varchar', { length: 20 }).notNull().default('development') // 'development', 'staging', 'production'
      .column.name('name').type('varchar', { length: 255 }).notNull()
      .column.name('file_name').type('varchar', { length: 500 }).notNull()
      .column.name('checksum').type('varchar', { length: 64 }).notNull()
      .column.name('applied_at').type('timestamp').notNull().default('CURRENT_TIMESTAMP')
      .column.name('applied_by').type('varchar', { length: 100 }).notNull()
      .column.name('description').type('text')
      .column.name('execution_time_ms').type('decimal', { precision: 10, scale: 3 }).notNull()
      .column.name('up_sql').type('text')
      .column.name('down_sql').type('text')
      .constraint.unique(['name', 'file_name', 'environment'])
      .toQuery().text;

    const tableIndex = this.querier.index.create.name(`${this.options.tableName}_name_file_name_environment_idx`)
      .notExists()
      .on.table(`${this.options.tableSchema}.${this.options.tableName}`)
      .with.column('name').column('file_name').column('environment')
      .toQuery().text;

    try {
      await this.transaction.execute(table);
      await this.transaction.execute(tableIndex);

      this.span.info(`Migrator tables created`);
      this.span.status({ type: StatusEnum.RESOLVED });
    } catch (error: any) {
      this.span.error(`Error executing migration up: ${error.message}`);
      this.span.status({ type: StatusEnum.REJECTED, message: error.message });
      this.span.attributes({ error: { name: error.name, message: error.message, cause: error.cause ?? 'unknown' } });

      throw error;
    }

    this.span.attributes({ query: `${table}; ${tableIndex};` });
  }

  async down(): Promise<void> {
    const table = `DROP TABLE IF EXISTS ${this.options.tableSchema}.${this.options.tableName} CASCADE;`;
    const tableIndex =
      `DROP INDEX IF EXISTS ${this.options.tableSchema}.${this.options.tableName}_name_file_name_environment_idx;`;

    try {
      await this.transaction.execute(table);
      await this.transaction.execute(tableIndex);

      this.span.info(`Migrator tables dropped`);
      this.span.status({ type: StatusEnum.RESOLVED });
    } catch (error: any) {
      this.span.error(`Error executing migration down: ${error.message}`);
      this.span.status({ type: StatusEnum.REJECTED, message: error.message });
      this.span.attributes({ error: { name: error.name, message: error.message, cause: error.cause ?? 'unknown' } });

      throw error;
    }

    this.span.attributes({ query: `${table}; ${tableIndex};` });
  }
}

export default CreateMigration;
