import type { LogRecordType, TracerOptionsType } from '~/tracer/types.ts';
import type { TracerInterface } from '~/tracer/interfaces.ts';

import LogLevelEnum from '~/tracer/enums/log-level.enum.ts';

export class Tracer implements TracerInterface {
  constructor(public options: TracerOptionsType) {}

  private shouldLog(level: LogLevelEnum, minLevel: LogLevelEnum): boolean {
    return level >= minLevel;
  }

  private createLogType(level: LogLevelEnum, message: string, context?: Record<string, any>): LogRecordType {
    return {
      level,
      time: Date.now(),
      namespace: this.options.namespace,
      message,
      context,
    };
  }

  private emit(level: LogLevelEnum, message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(level, this.options.level)) return;

    const redact = this.options.redact ?? ((_, v) => v);
    const safe = Object.fromEntries(
      Object.entries({
        ...(this.options.context || {}),
        ...(context || {}),
      }).map(([k, v]) => [k, redact(k, v)]),
    );

    const record = this.createLogType(level, message, Object.keys(safe).length ? safe : undefined);

    for (const transport of this.options.transports) {
      if (transport.minLevel && !this.shouldLog(level, transport.minLevel)) continue;

      try {
        void transport.write(record);
      } catch {
        // intentionally ignore synchronous errors from transport.write
      }
    }
  }

  public child(extra: Partial<TracerOptionsType>) {
    return new Tracer({
      ...this.options,
      namespace: extra.namespace ?? this.options.namespace,
      context: { ...(this.options.context || {}), ...(extra.context || {}) },
    });
  }

  public flush(): Promise<void> {
    const promises = this.options.transports
      .map((t) => t.flush?.())
      .filter((p) => p !== undefined);

    return Promise.all(promises).then(() => {});
  }

  public close(): Promise<void> {
    const promises = this.options.transports
      .map((t) => t.close?.())
      .filter((p) => p !== undefined);

    return Promise.all(promises).then(() => {});
  }

  public debug(message: string, context?: Record<string, any>): void {
    this.emit(LogLevelEnum.DEBUG, message, context);
  }

  public info(message: string, context?: Record<string, any>): void {
    this.emit(LogLevelEnum.INFO, message, context);
  }

  public warn(message: string, context?: Record<string, any>): void {
    this.emit(LogLevelEnum.WARN, message, context);
  }

  public error(message: string, context?: Record<string, any>): void {
    this.emit(LogLevelEnum.ERROR, message, context);
  }

  public fatal(message: string, context?: Record<string, any>): void {
    this.emit(LogLevelEnum.FATAL, message, context);
  }
}

export default Tracer;
