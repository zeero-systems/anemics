import { MigrationInterface } from './interfaces.ts';

export type MigrationActionType = 'migration' | 'seed';

export type MigrationRecordType = { fileName: string, checksum: string, target: MigrationInterface };

export type MigratorOptionsType = {
  prefix?: string;
  /**
   * Pattern for locating migration files. Use {name} as placeholder for the migration name.
   * Examples:
   * - './migrations/{name}/*.migration.ts' - migrations in a local migrations folder
   * - './src/migrations/{name}/*.migration.ts' - migrations in src folder
   * - '/absolute/path/migrations/{name}/*.migration.ts' - absolute path
   * - 'file:///absolute/path/migrations/{name}/*.migration.ts' - file URL
   */
  pattern: string;
  tableName: string;
  environment?: string;
  applyBy?: string;
};

export default {}

