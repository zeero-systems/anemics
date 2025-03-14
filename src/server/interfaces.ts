import { BodyType } from '~/server/types.ts';
import HttpStatusEnum from '~/server/enums/HttpStatusEnum.ts';

export interface RequesterInterface extends Request {
  request: Request
}

export interface ResponserInterface {
  raw: any
  body: BodyType
  headers: Headers | undefined
  status: HttpStatusEnum | undefined
  statusText: string | undefined
  setRaw(raw: any): void
  setBody(body: BodyType): void
  setHeaders(headers: Headers): void
  setHeader(name: string, value: string): void
  setStatus(status: HttpStatusEnum): void
  setStatusText(statusText: string): void
}

export interface PathInterface { 
  [key: string]: string | number 
}

export interface QueryInterface extends URLSearchParams {}

export default {}