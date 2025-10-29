import { MigrationInterface } from './interfaces.ts';

export type MigrationActionType = 'migration' | 'seed';

export type MigrationRecordType = { fileName: string, checksum: string, target: MigrationInterface };

export type MigratorOptionsType = {
  prefix?: string;
  pattern: string;
  tableName: string;
  environment?: string;
  applyBy?: string;
};

export default {}

