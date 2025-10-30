import type { DatabaseInterface, TransactionInterface } from '~/persister/interfaces.ts';
import type { QuerierInterface } from '~/querier/interfaces.ts';
import type { MigrationRecordType, MigratorOptionsType } from '~/migrator/types.ts';
import type { MigrationInterface, MigratorInterface } from '~/migrator/interfaces.ts';

import { expandGlob } from '@std/fs';
import { ContainerInterface, SpanEnum, SpanInterface, StatusEnum, TracerInterface } from '@zeero/commons';

import CreateMigration from '~/migrator/migrations/create.migration.ts';

export class Migrator implements MigratorInterface {
  options: MigratorOptionsType;

  constructor(
    public querier: QuerierInterface,
    public database: DatabaseInterface,
    public container: ContainerInterface,
    public tracer: TracerInterface,
    options?: MigratorOptionsType,
  ) {
    this.options = {
      prefix: '-',
      pattern: './migrations/{name}/**/*.migration.ts',
      tableName: 'migrations',
      tableSchema: 'private',
      environment: 'development',
      ...(options || {}),
    };
  }

  async shouldMigrate(
    span: SpanInterface,
    transaction: TransactionInterface,
    migrations: Array<MigrationRecordType>,
  ): Promise<Array<MigrationRecordType>> {
    const shouldMigrateSpan = span.child({ name: 'filter migrations', kind: SpanEnum.INTERNAL });

    const toApply: Array<MigrationRecordType> = [];
    const mismatches: Array<MigrationRecordType> = [];
    const skippings: Array<MigrationRecordType> = [];

    const tableExistsQuery = this.querier.query
      .select.column('COUNT(*)', 'count')
      .from.table('information_schema.tables')
      .where
        .and('table_name', 'eq', `${this.options.tableName}`)
        .and('table_schema', 'eq', `${this.options.tableSchema}`)
      .toQuery();

    const tableExistsResult = await transaction.execute<{ count: string }>(tableExistsQuery.text, {
      args: tableExistsQuery.args,
    });
    const tableExists = parseInt(tableExistsResult.rows[0].count, 10) > 0;

    for (const migration of migrations) {
      let exists = false;
      let checksumMatches = false;

      if (tableExists) {
        const existingQuery = this.querier.query
          .select
            .column('id')
            .column('checksum')
            .column('file_name')
            .column('applied_at')
          .from.table(`${this.options.tableSchema}.${this.options.tableName}`)
          .where
            .and('name', 'eq', `${migration.name}`)
            .and('file_name', 'eq', `${migration.fileName}`)
            .and('environment', 'eq', `${this.options.environment}`)
          .toQuery();

        const existingResult = await transaction.execute<{
          id: number;
          name: string;
          checksum: string;
          file_name: string;
          applied_at: Date;
        }>(existingQuery.text, { args: existingQuery.args });

        exists = existingResult.rows.length > 0;
        checksumMatches = exists && existingResult.rows[0].checksum === migration.checksum;
        const migrationAttributes = {
          exists,
          name: migration.name,
          fileName: migration.fileName,
          checksumMatches,
        };

        shouldMigrateSpan.event({ name: `checked`, attributes: migrationAttributes });
      }

      if (!exists) {
        toApply.push(migration);
      }

      if (exists && !checksumMatches) {
        mismatches.push(migration);
      }

      if (exists && checksumMatches) {
        skippings.push(migration);
      }
    }

    if (toApply.length > 0) {
      shouldMigrateSpan.info(`Should migrate - not found in database`, {
        toApply: toApply.map((m) => m.fileName),
      });
    }

    if (mismatches.length > 0) {
      shouldMigrateSpan.warn(`Will not migrate - migration was modified after being applied`, {
        mismatches: mismatches.map((m) => m.fileName),
      });
    }

    if (skippings.length > 0) {
      shouldMigrateSpan.info(`Will not migrate - already in database`, {
        skippings: skippings.map((m) => m.fileName),
      });
    }

    shouldMigrateSpan.status({ type: StatusEnum.RESOLVED });
    shouldMigrateSpan.attributes({
      toApply: toApply.map((m) => m.fileName),
      mismatches: mismatches.map((m) => m.fileName),
      skippings: skippings.map((m) => m.fileName),
    });
    shouldMigrateSpan.end();

    return toApply;
  }

  async getMigrations(
    span: SpanInterface,
    transaction: TransactionInterface,
    name?: string,
    only: Array<string> = [],
  ): Promise<Array<MigrationRecordType>> {
    const spanMigrations = span.child({ name: `get migrations`, kind: SpanEnum.INTERNAL });

    let searchPath: string;
    const migrations: Array<MigrationRecordType> = [];

    if (name) {
      searchPath = this.options.pattern.replace('{name}', name);

      if (searchPath.startsWith('file://')) {
        searchPath = searchPath.substring(7);
      }

      if (!searchPath.startsWith('/')) {
        searchPath = `${Deno.cwd()}/${searchPath}`;
      }
      
      for await (const dirEntry of expandGlob(searchPath)) {
        if (dirEntry.isFile) {
          if (only.length == 0 || only.includes(dirEntry.name || '')) {
            const importPath = dirEntry.path.startsWith('file://') ? dirEntry.path : `file://${dirEntry.path}`;
            const module = await import(importPath);
            const target = new module.default(
              span,
              this.querier,
              transaction,
              this.options,
            ) as MigrationInterface;
            migrations.push({
              name,
              target,
              fileName: dirEntry.name,
              checksum: await this.getMigrationChecksum(dirEntry.path),
            });
          }
        }
      }
    } else {
      const migratorMigrations = [CreateMigration]
      for (const MigrationClass of migratorMigrations) {
        const target = new MigrationClass(
          span,
          this.querier,
          transaction,
          this.options,
        ) as MigrationInterface;
        migrations.push({
          name: 'migrator',
          target,
          fileName: `create.migration.ts`,
          checksum: '',
        });
      }
    }

    const attributes = { migrations: migrations.map((m) => ({ fileName: m.fileName, checksum: m.checksum })) };
    spanMigrations.info(`Found ${migrations.length} migrations in ${name || 'migrator'}`, attributes);
    spanMigrations.status({ type: StatusEnum.RESOLVED });
    spanMigrations.attributes(attributes);
    spanMigrations.end();

    return migrations;
  }

  async execute(
    span: SpanInterface,
    transaction: TransactionInterface,
    migrations: Array<MigrationRecordType>,
    type: 'up' | 'down',
  ): Promise<void> {
    const spanExecute = span.child({ name: 'execute migrations', kind: SpanEnum.INTERNAL });

    for (const migration of migrations) {
      const migrationSpan = spanExecute.child({ name: `execute ${migration.fileName}`, kind: SpanEnum.CLIENT });
      migration.target.span = migrationSpan;
      await (migration.target[type] as any)();
      migrationSpan.end();

      if (type == 'up' && migration.target.persist) {
        const persistSpan = spanExecute.child({ name: `persist ${migration.fileName}`, kind: SpanEnum.CLIENT });

        const time = Number((migrationSpan.options.endTime || 0) - migrationSpan.options.startTime).toFixed(3);

        const table = this.querier.query.insert
          .table(`${this.options.tableSchema}.${this.options.tableName}`)
          .column('action', `${migration.target.action || 'migration'}`)
          .column('name', `${migration.name}`)
          .column('environment', `${this.options.environment}`)
          .column('applied_by', `${this.options.applyBy || 'system'}`)
          .column('description', `${migration.target.description || ''}`)
          .column('file_name', `${migration.fileName}`)
          .column('up_sql', `${migration.target.up_sqls?.join(';') || ''}`)
          .column('down_sql', `${migration.target.down_sqls?.join(';') || ''}`)
          .column('execution_time_ms', `${time}`)
          .column('checksum', `${migration.checksum || ''}`)
          .returns.column('id')
          .toQuery();

        const migrationRecord = await transaction.execute<{ id: number }>(table.text, { args: table.args });

        persistSpan.attributes({ id: migrationRecord.rows[0].id });
        persistSpan.status({ type: StatusEnum.RESOLVED });
        persistSpan.end();
      }
    }
  }

  async getMigrationChecksum(filePath: string): Promise<string> {
    const content = await Deno.readTextFile(filePath);
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  async up(name?: string, only: Array<string> = []): Promise<boolean> {
    const span = this.tracer.start({ name: `migrator up`, kind: SpanEnum.CLIENT });

    const client = await this.database.connection();
    const transaction = client.transaction(`${this.options.tableName}_up`);

    try {
      let returnValue = true;
      await transaction.begin();

      let migrations = await this.getMigrations(span, transaction, name, only);

      if (migrations.length > 0) {
        migrations = await this.shouldMigrate(span, transaction, migrations);
      }

      if (migrations.length > 0) {
        await this.execute(span, transaction, migrations, 'up');
      } else {
        span.info(`Skipping ${name || 'migrator'} migrations - not found, applied or mismatch`);
        returnValue = false;
      }

      await transaction.commit();

      span.status({ type: StatusEnum.RESOLVED });

      return returnValue;
    } catch (error: any) {
      const err = { name: error.name, message: error.message, cause: error.cause ?? 'unknown' };

      span.error(`Error executing up: ${error.message}`, { error: err });
      span.status({ type: StatusEnum.REJECTED, message: error.message });
      span.attributes({ error: err });

      throw error;
    } finally {
      await transaction.release();
      await client.disconnect();
      span.end();
    }
  }

  async down(name?: string, only: Array<string> = []): Promise<boolean> {
    const span = this.tracer.start({ name: `migrator down`, kind: SpanEnum.INTERNAL });

    const client = await this.database.connection();
    const transaction = client.transaction(`${this.options.tableName}_down`);

    try {
      let returnValue = true;
      await transaction.begin();

      const migrations = await this.getMigrations(span, transaction, name, only);

      if (migrations.length === 0) {
        span.info(`Skipping migration ${name || 'migrator'} - already applied or checksum mismatch`);
        span.status({ type: StatusEnum.RESOLVED });
        span.end();

        returnValue = false;
      } else {
        await this.execute(span, transaction, migrations, 'down');
      }

      await transaction.commit();

      span.status({ type: StatusEnum.RESOLVED });

      return returnValue;
    } catch (error: any) {
      span.error(`Error executing down: ${error.message}`, { error });
      span.status({ type: StatusEnum.REJECTED, message: error.message });
      span.attributes({ error: { name: error.name, message: error.message, cause: error.cause ?? 'unknown' } });

      throw error;
    } finally {
      await transaction.release();
      await client.disconnect();
      span.end();
    }
  }
}

export default Migrator;
