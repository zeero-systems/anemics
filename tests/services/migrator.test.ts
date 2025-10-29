import { describe, it, beforeAll, afterAll } from '@std/bdd';
import { expect } from '@std/expect';

import type { CommonOptionsType } from '~/persister/types.ts';

import { Tracer, Container } from '@zeero/commons';
import Migrator from '~/migrator/services/migrator.service.ts';
import Postgresql from '~/persister/postgresql/postgresql.database.ts';
import Querier from '~/querier/services/querier.service.ts';

describe('migrator', () => {
  const commonOptions: CommonOptionsType = {
    name: 'migrator-test',
    naming: {} as any,
    placeholder: '$',
    placeholderType: 'counter',
    syntax: 'postgresql',
    pool: {
      max: 10,
      lazy: true
    },
  };

  const clientOptions = {
    database: 'postgres',
    hostname: '127.0.0.1',
    password: 'your-super-secret-and-long-postgres-password',
    port: 5432,
    schema: 'public',
    user: 'postgres.your-tenant-id',
  };

  const database = new Postgresql(commonOptions, clientOptions);
  const querier = new Querier({ syntax: 'postgresql', placeholder: '$', placeholderType: 'counter' });
  const tracer = new Tracer({ name: 'migrator-test', transports: [] });
  const container = new Container();

  const tableName = 'test_migrations';
  const migrator = new Migrator(querier, database, container, tracer, {
    prefix: '-',
    pattern: '/src/{name}/migrations/*.migration.ts',
    tableName,
    tableSchema: 'public',
    environment: 'test',
  });

  beforeAll(async () => {
    await migrator.up();
  });

  afterAll(async () => {
    try {
      await migrator.down();
    } catch (error) {
      console.error('Error cleaning up migrator tables:', error);
    }
  });

  describe('Migrator service', () => {
    it('should return false when no migrations found', async () => {
      const result = await migrator.up('nonexistent-folder');
      expect(result).toBe(false);
    });

    it('should not re-run already applied migrations', async () => {
      const client = await database.connection();
      
      try {
        const firstRun = await migrator.up();
        expect(firstRun).toBe(false);

        const recordQuery = querier.query
          .select
            .column('id')
            .column('file_name')
            .column('name')
            .column('checksum')
          .from.table(tableName)
          .where
            .and('environment', 'eq', 'development')
          .toQuery();

        const records = await client.execute(recordQuery.text, { args: recordQuery.args });
        const initialCount = records.rows.length;

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
            .column('checksum')
            .column('file_name')
          .from.table(tableName)
          .where
            .and('environment', 'eq', 'test')
          .toQuery();

        const result = await client.execute(checksumQuery.text, { args: checksumQuery.args });
        expect(result.rows.length).toBeGreaterThan(0);

        const record = result.rows[0] as any;
        expect(record.checksum).toBeDefined();
        expect(typeof record.checksum).toBe('string');
        expect(record.checksum.length).toBe(64); // SHA-256 produces 64 hex characters
      } finally {
        await client.disconnect();
      }
    });

    it('should respect environment filtering', async () => {
      const client = await database.connection();
      
      try {
        const envQuery = querier.query
          .select
            .column('environment')
          .from.table(tableName)
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
            .column('execution_time_ms')
            .column('file_name')
          .from.table(tableName)
          .where
            .and('environment', 'eq', 'test')
          .toQuery();

        type MigratorType = { execution_time_ms: number; file_name: string }

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
          await migrator.up('///invalid-pattern///');
        } catch (error) {
          expect(error).toBeDefined();
        }

        const tableQuery = querier.query
          .select.column('table_name')
          .from.table('information_schema.tables')
          .where
            .and('table_name', 'eq', tableName)
          .toQuery();

        const result = await client.execute(tableQuery.text, { args: tableQuery.args });
        expect(result.rows.length).toBe(1); // Table should still exist
      } finally {
        await client.disconnect();
      }
    });
  });
});