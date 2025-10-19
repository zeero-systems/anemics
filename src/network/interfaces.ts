import type { ServerOptionsType } from '~/network/types.ts';
import HttpStatusEnum from '~/network/enums/http-status.enum.ts';
import MethodEnum from '~/network/enums/method.enum.ts';

export interface ServerInterface {
  accepts: Array<MethodEnum>
  options: ServerOptionsType,
  start(handler: (...options: any[]) => Promise<any>): Promise<void>
  stop(): Promise<void>
}

export interface RequesterInterface<T = BodyInit> extends Request {
  parsed: T | undefined | null
}

export interface ResponserInterface {
  body: BodyInit | undefined | null
  parsed: BodyInit | undefined | null
  headers: Headers | undefined
  status: HttpStatusEnum | undefined
  statusText: string | undefined
  metadata: Record<string | symbol, any>
  setBody(value: BodyInit | undefined | null): void
  setParsed(value: BodyInit | undefined | null): void
  setHeaders(headers: Headers): void
  setHeader(name: string, value: string): void
  setStatus(status: HttpStatusEnum): void
  setStatusText(statusText: string): void
  addMetadata(key: string | symbol, value: any): void
}

export default {}
