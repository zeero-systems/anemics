import type { DatabaseInterface } from '~/persister/interfaces.ts';
import type { QuerierInterface } from '~/querier/interfaces.ts';
import type {
  MigrationFetchOptionsType,
  MigrationRecordType,
  MigratorOptionsType,
} from '~/migrator/types.ts';
import type { MigrationInterface, MigratorInterface } from '~/migrator/interfaces.ts';
import type { ContainerInterface, TracerInterface } from '@zeero/commons';

import { expandGlob, WalkEntry } from '@std/fs';
import { SpanEnum, StatusEnum } from '@zeero/commons';
import Raw from '~/querier/services/raw.clause.ts'

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

  async createTableIfNotExists(tracer: TracerInterface): Promise<boolean> {
    await using client = await this.database.connection();
    await using transaction = client.transaction(`${this.options.tableName}_check`);

    await transaction.begin();

    const tableExistsSpan = tracer.start({ name: 'check migrator table exists', kind: SpanEnum.INTERNAL });

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

    if (!tableExists) {
      const migrationtable = this.querier
        .table
        .create.name(`${this.options.tableSchema}.${this.options.tableName}`).notExists()
        .column.name('id').type('serial').primaryKey().notNull().unique()
        .column.name('applied_at').type('timestamp').notNull().default('CURRENT_TIMESTAMP')
        .column.name('applied_by').type('varchar', { length: 100 }).notNull()
        .column.name('environment').type('varchar', { length: 20 }).notNull().default('development') // 'development', 'staging', 'production'
        .toQuery();

      await transaction.execute(migrationtable.text, { args: migrationtable.args });

      const migrationFileTable = this.querier.table
        .create.name(`${this.options.tableSchema}.${this.options.tableName}_files`).notExists()
          .column.name('id').type('serial').primaryKey().notNull().unique()
          .column.name('migration_id').type('integer').notNull()
          .column.name('type').type('varchar', { length: 20 }).notNull().default('migration') // migration or seed
          .column.name('file_name').type('varchar', { length: 500 }).notNull().unique()
          .column.name('checksum').type('varchar', { length: 64 }).notNull()
          .column.name('description').type('text')
          .column.name('execution_time_ms').type('decimal', { precision: 10, scale: 3 }).notNull()
          .column.name('up_sql').type('text')
          .column.name('down_sql').type('text')
          .constraint.foreignKey('migration_id')
            .references(`${this.options.tableSchema}.${this.options.tableName}`, { column: 'id' })
            .onDelete('cascade')
            .onUpdate('cascade')
        .toQuery();

      await transaction.execute(migrationFileTable.text, { args: migrationFileTable.args });

      const migrationFileForeignKeyIndex = this.querier.index
        .create.name(`${this.options.tableName}_migration_id_fkey`)
          .on.table(`${this.options.tableSchema}.${this.options.tableName}_files`)
          .with.column('migration_id')
        .toQuery();

      await transaction.execute(migrationFileForeignKeyIndex.text, { args: migrationFileForeignKeyIndex.args });

      tableExistsSpan.info(`Migrator tables ${this.options.tableName}, ${this.options.tableName}_files created in schema ${this.options.tableSchema}`);

    }

    tableExistsSpan.status(StatusEnum.RESOLVED);
    tableExistsSpan.attributes({ tableExists });
    tableExistsSpan.end();

    await transaction.commit();

    return tableExists;
  }
  
  async getFileMigrations(options: MigrationFetchOptionsType): Promise<Array<MigrationRecordType>> {
    const tracerGet = options.tracer.start({ name: 'migration files', kind: SpanEnum.INTERNAL });

    const files: Array<WalkEntry> = [];
    
    let searchPath = this.options.pattern

    if (searchPath.startsWith('file://')) {
      searchPath = searchPath.substring(7);
    }

    if (!searchPath.startsWith('/')) {
      searchPath = `${Deno.cwd()}/${searchPath}`;
    }

    for await (const dirEntry of expandGlob(searchPath)) {
      if (dirEntry.isFile) {
        if (options?.includes && options.includes.length > 0) {
          const matched = options.includes.some((include) => dirEntry.name.includes(include));
          if (matched) {
            files.push(dirEntry);
          }
        } else {
          files.push(dirEntry);
        }
      }
    }

    const migrations: Array<MigrationRecordType> = [];

    for (const file of files) {
      const importPath = file.path.startsWith('file://') ? file.path : `file://${file.path}`;
      const module = await import(importPath);
      const target = new module.default(
        options.tracer,
        this.querier,
        options.transaction,
        this.options,
      ) as MigrationInterface;
      const checksum = await this.getMigrationChecksum(file.path);

      migrations.push({ target, fileName: file.name, checksum });
    }

    tracerGet.info(`Found ${files.length} migration files`, { count: files.length });

    tracerGet.status(StatusEnum.RESOLVED);
    tracerGet.attributes({ count: files.length });
    tracerGet.end();

    return migrations;
  }

  async getPersistedMigrations(options: MigrationFetchOptionsType): Promise<Array<{ id: number; file_name: string }>> {
    const select = this.querier.query
      .select
        .column('m.id')
        .column('mf.file_name')
      .from.table(`${this.options.tableSchema}.${this.options.tableName}`, 'm')
      .left.table(`${this.options.tableSchema}.${this.options.tableName}_files`, 'mf')
        .on.and(new Raw('mf.migration_id = m.id'))
      .where.and('environment', 'eq', this.options.environment)
      .order.desc('m.id')

    if (options.count) {
      select.limit.at(options.count);
    }
    
    const query = select.toQuery()

    const persistedMigrations = await options.transaction.execute<{ id: number; file_name: string }>(query.text, {
      args: query.args,
    });
    
    return persistedMigrations.rows
  }

  async getMigrationChecksum(filePath: string): Promise<string> {
    const content = await Deno.readTextFile(filePath);
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  async up(includes?: Array<string>): Promise<boolean> {
    using tracer = this.tracer.start({ name: `migrator up`, kind: SpanEnum.CLIENT });

    try {
      await this.createTableIfNotExists(tracer);

      let returnValue = true;
      let migrationsToPersist: Array<MigrationRecordType> = [];
      let fileNamesToPersists: Array<string> = [];

      await using client = await this.database.connection();
      await using transaction = client.transaction(`${this.options.tableName}_up`);
      
      await transaction.begin();

      const fileMigrations = await this.getFileMigrations({ tracer, transaction, includes });

      if (fileMigrations.length > 0) {
        const persistedMigrations = await this.getPersistedMigrations({ tracer, transaction, includes });

        migrationsToPersist = fileMigrations.filter((f) => persistedMigrations.find((r) => r.file_name === f.fileName) === undefined);

        fileNamesToPersists = migrationsToPersist.map((m) => m.fileName);
      }

      if (migrationsToPersist.length > 0) {
        tracer.info(`Applying ${migrationsToPersist.length} migrations`, { files: fileNamesToPersists });
        await this.executeUp(migrationsToPersist, { tracer, transaction });
      } else {
        tracer.info(`Skipping migrations - not found, applied or mismatch`);
        returnValue = false;
      }
      
      await transaction.commit();
      
      tracer.status(StatusEnum.RESOLVED);
      tracer.attributes({ appliedMigrations: fileNamesToPersists });

      return returnValue;
    } catch (error: any) {
      const err = { name: error.name, message: error.message, cause: error.cause ?? 'unknown' };

      tracer.error(`Error executing up: ${error.message}`, { error: err });
      tracer.status(StatusEnum.REJECTED);
      tracer.attributes({ error: err });

      throw error;
    }
  }

   async down(includes?: Array<string>, count?: number): Promise<boolean> {
    using tracer = this.tracer.start({ name: `migrator down`, kind: SpanEnum.INTERNAL });

    try {
      await this.createTableIfNotExists(tracer);

      let returnValue = true;
      let migrationsToRollback: Array<MigrationRecordType> = [];
      let fileNamesToRollback: Array<string> = [];

      await using client = await this.database.connection();
      await using transaction = client.transaction(`${this.options.tableName}_down`);

      await transaction.begin();

      const fileMigrations = await this.getFileMigrations({ tracer, transaction, includes });

      if (fileMigrations.length > 0) {
        const persistedMigrations = await this.getPersistedMigrations({ tracer, transaction, includes, count });

        migrationsToRollback = fileMigrations.filter((f) => persistedMigrations.find((r) => r.file_name === f.fileName));

        fileNamesToRollback = migrationsToRollback.map((m) => m.fileName);
      }

      if (migrationsToRollback.length > 0) {
        tracer.info(`Rolling back ${migrationsToRollback.length} migrations`, { files: fileNamesToRollback });
        await this.executeDown(migrationsToRollback, { tracer, transaction });
      } else {
        tracer.info(`Skipping migrations - not found, applied or mismatch`);
        returnValue = false;
      }

      await transaction.commit();

      tracer.status(StatusEnum.RESOLVED);
      tracer.attributes({ rolledBackMigrations: fileNamesToRollback });

      return returnValue;
    } catch (error: any) {
      tracer.error(`Error executing down: ${error.message}`, { error });
      tracer.status(StatusEnum.REJECTED);
      tracer.attributes({ error: { name: error.name, message: error.message, cause: error.cause ?? 'unknown' } });

      throw error;
    }
  }

  async executeUp(
    migrations: Array<MigrationRecordType>,
    options: MigrationFetchOptionsType,
  ): Promise<void> {
    let migrationId: number | undefined = undefined;

    if (migrations.some((m) => m.target.persist)) {
      const table = this.querier.query.insert
        .table(`${this.options.tableSchema}.${this.options.tableName}`)
          .column('environment', `${this.options.environment}`)
          .column('applied_by', `${this.options.applyBy || 'system'}`)
          .returns.column('id')
        .toQuery();

      migrationId = await options.transaction.execute<{ id: number }>(table.text, { args: table.args }).then((res) =>
        res.rows[0].id
      );
    }

    for (const migration of migrations) {
      const migrationTracer = options.tracer.start({ name: `execute ${migration.fileName}`, kind: SpanEnum.CLIENT });
      migration.target.tracer = migrationTracer;

      await migration.target.up();

      migrationTracer.status(StatusEnum.RESOLVED);
      migrationTracer.end();

      if (migration.target.persist) {
        const persistTracer = options.tracer.start({ name: `persist ${migration.fileName}`, kind: SpanEnum.CLIENT });

        const time = Number((migrationTracer.trace.endTime || 0) - migrationTracer.trace.startTime).toFixed(3);

        const table = this.querier.query.insert
          .table(`${this.options.tableSchema}.${this.options.tableName}_files`)
          .column('migration_id', `${migrationId}`)
          .column('type', `${migration.target.type || 'migration'}`)
          .column('description', `${migration.target.description || ''}`)
          .column('file_name', `${migration.fileName}`)
          .column('up_sql', `${migration.target.up_sqls?.join(';') || ''}`)
          .column('down_sql', `${migration.target.down_sqls?.join(';') || ''}`)
          .column('execution_time_ms', `${time}`)
          .column('checksum', `${migration.checksum || ''}`)
          .returns.column('id')
          .toQuery();

        const migrationRecord = await options.transaction.execute<{ id: number }>(table.text, { args: table.args });

        persistTracer.attributes({ id: migrationRecord.rows[0].id, migrationId });
        persistTracer.status(StatusEnum.RESOLVED);
        persistTracer.end();
      }
    }
  }

  async executeDown(
    migrations: Array<MigrationRecordType>,
    options: MigrationFetchOptionsType,
  ): Promise<void> {

    const migrationIds: Array<number> = [];

    for (const migration of migrations) {
      const migrationTracer = options.tracer.start({ name: `execute ${migration.fileName}`, kind: SpanEnum.CLIENT });
      migration.target.tracer = migrationTracer;
      await migration.target.down?.();

      if (migration.target.persist) {
        const selectQuery = this.querier.query
          .select
            .column('m.id')
          .from.table(`${this.options.tableSchema}.${this.options.tableName}`, 'm')
          .left.table(`${this.options.tableSchema}.${this.options.tableName}_files`, 'mf')
            .on.and(new Raw('mf.migration_id = m.id'))
          .where.and('mf.file_name', 'eq', migration.fileName)
          .toQuery();

        const result = await options.transaction.execute<{ id: number }>(selectQuery.text, { args: selectQuery.args });

        if (result.rows.length > 0) {
          migrationIds.push(result.rows[0].id);
        }
      }

      migrationTracer.status(StatusEnum.RESOLVED);
      migrationTracer.end();
    }

    if (migrationIds.length > 0) {
      const deleteQuery = this.querier.query
        .delete.table(`${this.options.tableSchema}.${this.options.tableName}`)
          .where.and('id', 'in', migrationIds)
        .toQuery();
  
      await options.transaction.execute(deleteQuery.text, { args: deleteQuery.args });
  
      options.tracer.info(`Removed persisted migrations`, { migrationIds });
      options.tracer.attributes({ migrationIds });
    }

  }

}

export default Migrator;
