import { afterAll, describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import type { CommonOptionsType } from '~/persister/types.ts';

import { Container, Tracer } from '@zeero/commons';
import Migrator from '~/migrator/services/migrator.service.ts';
import Postgresql from '~/persister/postgresql/postgresql.database.ts';
import Querier from '~/querier/services/querier.service.ts';
import Raw from '~/querier/services/raw.clause.ts';

describe('migrator', () => {
  const commonOptions: CommonOptionsType = {
    name: 'migrator-test',
    naming: {} as any,
    placeholder: '$',
    placeholderType: 'counter',
    syntax: 'postgresql',
    pool: {
      max: 10,
      lazy: true,
    },
  };

  const clientOptions = {
    database: 'postgres',
    hostname: 'localhost',
    password: 'postgres',
    port: 5432,
    schema: 'public',
    user: 'postgres',
  };

  const database = new Postgresql(commonOptions, clientOptions);
  const querier = new Querier({ syntax: 'postgresql', placeholder: '$', placeholderType: 'counter' });
  const tracer = new Tracer({ name: 'migrator-test', transports: [] });
  const container = new Container();

  const tableName = 'test_migrations';
  const tableSchema = 'public';
  const migrator = new Migrator(querier, database, container, tracer, {
    prefix: '-',
    pattern: './tests/migrations/*.migration.ts',
    tableName,
    tableSchema,
    environment: 'test',
  });

  afterAll(async () => {
    try {
      await migrator.down();
      console.log('Cleanup completed successfully');
    } catch (error) {
      console.error('Error cleaning up migrator tables:', error);
    }
  });

  describe('Migrator service', () => {
    it('should return false when no migrations found', async () => {
      const result = await migrator.up(['nonexistent-folder']);
      expect(result).toBe(false);
    });

    it('should not re-run already applied migrations', async () => {
      const client = await database.connection();

      try {
        const firstRun = await migrator.up();
        expect(firstRun).toBe(true);

        const recordQuery = querier.query
          .select
            .column('mf.id')
            .column('mf.file_name')
            .column('mf.checksum')
          .from.table(`${tableSchema}.${tableName}`, 'm')
          .left.table(`${tableSchema}.${tableName}_files`, 'mf')
            .on.and(new Raw('mf.migration_id = m.id'))
          .where.and('m.environment', 'eq', 'test')
          .toQuery();

        const records = await client.execute(recordQuery.text, { args: recordQuery.args });
        const initialCount = records.rows.length;
        
        expect(initialCount).toBeGreaterThan(0);

        const secondRun = await migrator.up();
        expect(secondRun).toBe(false);

        const recordsAfter = await client.execute(recordQuery.text, { args: recordQuery.args });
        expect(recordsAfter.rows.length).toBe(initialCount);
      } finally {
        await client.disconnect();
      }
    });

    it('should calculate and store migration checksum', async () => {
      const client = await database.connection();

      try {
        const checksumQuery = querier.query
          .select
            .column('mf.id')
            .column('mf.file_name')
            .column('mf.checksum')
          .from.table(`${tableSchema}.${tableName}`, 'm')
          .left.table(`${tableSchema}.${tableName}_files`, 'mf')
            .on.and(new Raw('mf.migration_id = m.id'))
          .where.and('m.environment', 'eq', 'test')
          .toQuery();

        const result = await client.execute(checksumQuery.text, { args: checksumQuery.args });
        expect(result.rows.length).toBeGreaterThan(0);

        const record = result.rows[0] as any;
        expect(record.checksum).toBeDefined();
        expect(typeof record.checksum).toBe('string');
        expect(record.checksum.length).toBeGreaterThan(0);
      } finally {
        await client.disconnect();
      }
    });

    it('should respect environment filtering', async () => {
      const client = await database.connection();

      try {
        const envQuery = querier.query
          .select
          .column('m.environment')
          .from.table(`${tableSchema}.${tableName}`, 'm')
          .toQuery();

        const result = await client.execute(envQuery.text, { args: envQuery.args });

        result.rows.forEach((row: any) => {
          expect(row.environment).toBe('test');
        });
      } finally {
        await client.disconnect();
      }
    });

    it('should store execution time', async () => {
      const client = await database.connection();

      try {
        const timeQuery = querier.query
          .select
            .column('mf.id')
            .column('mf.execution_time_ms')
            .column('mf.file_name')
            .column('mf.checksum')
          .from.table(`${tableSchema}.${tableName}`, 'm')
          .left.table(`${tableSchema}.${tableName}_files`, 'mf')
            .on.and(new Raw('mf.migration_id = m.id'))
          .where.and('m.environment', 'eq', 'test')
          .toQuery();

        type MigratorType = { execution_time_ms: number; file_name: string };

        const result = await client.execute<MigratorType>(timeQuery.text, { args: timeQuery.args });
        expect(result.rows.length).toBeGreaterThan(0);

        const record = result.rows[0];

        expect(record.execution_time_ms).toBeDefined();
        expect(typeof Number(record.execution_time_ms)).toBe('number');
        expect(record.execution_time_ms).toBeGreaterThanOrEqual(0);
      } finally {
        await client.disconnect();
      }
    });

    it('should handle transaction rollback on error', async () => {
      const client = await database.connection();

      try {
        try {
          await migrator.up(['///invalid-pattern///']);
        } catch (error) {
          expect(error).toBeDefined();
        }

        const tableQuery = querier.query
          .select.column('table_name')
          .from.table('information_schema.tables')
          .where
          .and('table_name', 'eq', tableName)
          .and('table_schema', 'eq', tableSchema)
          .toQuery();
 
        const result = await client.execute(tableQuery.text, { args: tableQuery.args });
        expect(result.rows.length).toBe(1); // Table should still exist
      } finally {
        await client.disconnect();
      }
    });

    it('should delete migration entry from database after rollback with count', async () => {
      const client = await database.connection();

      try {
        await migrator.up();
      
        const beforeQuery = querier.query
          .select
            .column('m.id')
            .column('mf.file_name')
          .from.table(`${tableSchema}.${tableName}`, 'm')
          .left.table(`${tableSchema}.${tableName}_files`, 'mf')
            .on.and(new Raw('mf.migration_id = m.id'))
          .where.and('m.environment', 'eq', 'test')
          .toQuery();

        const beforeResult = await client.execute(beforeQuery.text, { args: beforeQuery.args });
        const beforeCount = beforeResult.rows.length;
        
        expect(beforeCount).toBeGreaterThan(0);

        const migrationRecord = beforeResult.rows[0] as any;
        const migrationId = migrationRecord.id;
        const migrationFileName = migrationRecord.file_name;

        const downResult = await migrator.down(undefined, 1);
        expect(downResult).toBe(true);

        const afterMainQuery = querier.query
          .select
            .column('id')
          .from.table(`${tableSchema}.${tableName}`)
          .where.and('id', 'eq', migrationId)
          .and('environment', 'eq', 'test')
          .toQuery();

        const afterMainResult = await client.execute(afterMainQuery.text, { args: afterMainQuery.args });
        expect(afterMainResult.rows.length).toBe(0);

        const afterFileQuery = querier.query
          .select
            .column('id')
          .from.table(`${tableSchema}.${tableName}_files`)
          .where.and('file_name', 'eq', migrationFileName)
          .toQuery();

        const afterFileResult = await client.execute(afterFileQuery.text, { args: afterFileQuery.args });
        expect(afterFileResult.rows.length).toBe(0);

        const afterTotalQuery = querier.query
          .select
            .column('m.id')
          .from.table(`${tableSchema}.${tableName}`, 'm')
          .where.and('m.environment', 'eq', 'test')
          .toQuery();

        const afterTotalResult = await client.execute(afterTotalQuery.text, { args: afterTotalQuery.args });
        expect(afterTotalResult.rows.length).toBe(beforeCount - 1);
      } finally {
        await client.disconnect();
      }
    });
  });
});
