import type { LogTransportInterface } from '~/tracer/interfaces.ts';

import LogLevelEnum from '~/tracer/enums/log-level.enum.ts';

export type LogRecordType = {
  level: LogLevelEnum;
  message: string;
  time: number;
  namespace?: string
  context?: Record<string, unknown>
}

export type TracerOptionsType = {
  level: LogLevelEnum;
  transports: Array<LogTransportInterface>;
  namespace?: string;
  redact?: (key: string, value: unknown) => unknown;
  context?: Record<string, unknown>;
}

export default {}
