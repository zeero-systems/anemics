import type { SpanInterface } from '@zeero/commons';
import type { MigrationInterface } from '~/migrator/interfaces.ts';
import type { MigratorOptionsType } from '~/migrator/types.ts';
import type { QuerierInterface } from '~/querier/interfaces.ts';
import type { TransactionInterface } from '~/persister/interfaces.ts';

import { StatusEnum } from '@zeero/commons';

export class TestTableMigration implements MigrationInterface {
  persist = true;
  description = 'Create test table for migration testing';

  constructor(
    public span: SpanInterface,
    public querier: QuerierInterface,
    public transaction: TransactionInterface,
    public options: MigratorOptionsType,
  ) {}

  async up(): Promise<void> {
    const table = this.querier.table
      .create.name('public.test_users').notExists()
        .column.name('id').type('serial').primaryKey().notNull().unique()
        .column.name('name').type('varchar', { length: 100 }).notNull()
        .column.name('email').type('varchar', { length: 255 }).notNull().unique()
        .column.name('created_at').type('timestamp').notNull().default('CURRENT_TIMESTAMP')
      .toQuery().text;

    try {
      await this.transaction.execute(table);
      
      this.span.info(`Test table created`);
      this.span.status({ type: StatusEnum.RESOLVED });
    } catch (error: any) {
      this.span.error(`Error executing migration up: ${error.message}`);
      this.span.status({ type: StatusEnum.REJECTED, message: error.message });
      this.span.attributes({ error: { name: error.name, message: error.message, cause: error.cause ?? 'unknown' } });

      throw error;
    }

    this.span.attributes({ query: table });
  }

  async down(): Promise<void> {
    const testTable = `DROP TABLE IF EXISTS ${this.options.tableSchema}.test_users CASCADE`;

    try {
      await this.transaction.execute(testTable);

      this.span.info(`Test table dropped`);
      this.span.status({ type: StatusEnum.RESOLVED });
    } catch (error: any) {
      this.span.error(`Error executing migration down: ${error.message}`);
      this.span.status({ type: StatusEnum.REJECTED, message: error.message });
      this.span.attributes({ error: { name: error.name, message: error.message, cause: error.cause ?? 'unknown' } });

      throw error;
    }

    this.span.attributes({ query: testTable });
  }
}

export default TestTableMigration;
