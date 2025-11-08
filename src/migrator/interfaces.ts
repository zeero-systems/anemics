import type { ContainerInterface, SpanInterface, TracerInterface } from '@zeero/commons';
import type { DatabaseInterface, TransactionInterface } from '~/persister/interfaces.ts';
import type { QuerierInterface } from '~/querier/interfaces.ts';
import type { MigrationActionType, MigrationOptionsType, MigratorOptionsType } from '~/migrator/types.ts';

export interface MigrationInterface {
  querier: QuerierInterface;
  span: SpanInterface;
  transaction: TransactionInterface;
  options: MigratorOptionsType;

  type?: MigrationActionType;
  persist?: boolean;
  up_sqls?: Array<string>;
  down_sqls?: Array<string>;
  description?: string;

  up(): Promise<void>;
  down?(): Promise<void>;
}

export interface MigratorInterface {
  querier: QuerierInterface;
  database: DatabaseInterface;
  container: ContainerInterface;
  tracer: TracerInterface;
  options: MigratorOptionsType;

  up(includes?: Array<string>): Promise<boolean>;
  down(includes?: Array<string>, count?: number): Promise<boolean>;
}

export default {};
