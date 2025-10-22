import type { LogRecordType } from '~/tracer/types.ts';
import type { LogTransportInterface } from '~/tracer/interfaces.ts';

import LogEnum from '~/tracer/enums/log-level.enum.ts';

export class ConsoleTransport implements LogTransportInterface {
  constructor(public minLevel: LogEnum = LogEnum.TRACE){}
  
  public write(record: LogRecordType): Promise<void> {
    const ts = new Date(record.time).toISOString();
    const ns = record.namespace ? `[${record.namespace}]` : '';
    const line = `${ts} ${String(record.level).toUpperCase()} ${ns} ${record.message}`;

    let log = console.log

    if (record.level === LogEnum.ERROR || record.level === LogEnum.FATAL) log = console.error
    if (record.level === LogEnum.WARN) log = console.warn
    if (record.level === LogEnum.INFO) log = console.info

    return Promise.resolve(log(line, Object.keys(record.context || {}).length ? record.context : undefined))
  }

  public flush(): Promise<void> {
    if (Deno.stdout) {
      return new Promise((resolve) => {
        const encoder = new TextEncoder()
        Deno.stdout.write(encoder.encode('')).then((err) => resolve());
      });
    }
    
    return Promise.resolve()
  }

  public close(): Promise<void> {
    return Promise.resolve();
  }
}

export default ConsoleTransport
