import type { LogRecordType, TracerOptionsType } from '~/tracer/types.ts';

import LogLevelEnum from '~/tracer/enums/log-level.enum.ts';

export interface TracerInterface {
  options: TracerOptionsType

  debug(message: string, context?: Record<string, any>): void
  info(message: string, context?: Record<string, any>): void
  warn(message: string, context?: Record<string, any>): void
  error(message: string, context?: Record<string, any>): void
  fatal(message: string, context?: Record<string, any>): void
}

export interface LogTransportInterface {
  minLevel?: LogLevelEnum
  write(record: LogRecordType): Promise<void>
  flush?(): Promise<void>
  close?(): Promise<void>
}

export default {}
