import type { NamingInterface } from '~/databaser/interfaces.ts';
import { AdapterEnum } from '~/databaser/enums/AdapterEnum.ts';

export type CommonOptionType = {
  name: string;
  naming: NamingInterface;
  adapter: AdapterEnum;
  attempts?: number;
  pool?: { max: number; lazy: boolean };
};

export type ClientOptionType = {
  database: string;
  hostname: string;
  password: string;
  port: number;
  schema: string;
  user: string;
};

export type TransactionIsolationType = 'read_committed' | 'repeatable_read' | 'serializable';

export type TransactionOptionType = {
  isolation?: TransactionIsolationType;
  read_only?: boolean;
  snapshot?: string;
};

export type SourceOptionsType = {
  common: CommonOptionType;
  options: ClientOptionType | string;
  extra?: Record<string, any>;
};
