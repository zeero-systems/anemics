import { BodyType } from '~/application/types.ts';
import HttpStatusEnum from '~/application/enums/http-status.annotation.ts';

export interface RequesterInterface extends Request {
  request: Request
}

export interface ResponserInterface {
  raw: any
  body: BodyType
  headers: Headers | undefined
  status: HttpStatusEnum | undefined
  statusText: string | undefined
  metadata: Record<string | symbol, any>
  setRaw(raw: any): void
  setBody(body: BodyType): void
  setHeaders(headers: Headers): void
  setHeader(name: string, value: string): void
  setStatus(status: HttpStatusEnum): void
  setStatusText(statusText: string): void
  addMetadata(key: string | symbol, value: any): void
}

export interface PathInterface { 
  [key: string]: string | number 
}

export interface QueryInterface extends URLSearchParams {}

export default {}