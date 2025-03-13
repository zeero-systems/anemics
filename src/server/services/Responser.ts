import type { ResponserInterface } from '~/server/interfaces.ts';
import type { BodyType } from '~/server/types.ts';

import HttpStatusEnum from '~/server/enums/HttpStatusEnums.ts';

export class Responser implements ResponserInterface {
  raw: any;
  body: BodyType 
  headers: Headers | undefined
  status: HttpStatusEnum | undefined
  statusText: string | undefined
  
  setRaw(raw: any) {
    this.raw = raw
  }
  setBody(body: BodyType) {
    this.body = body
  }

  setHeaders(headers: Headers) {
    this.headers = headers
  }
  setHeader(name: string, value: string) {
    if (!this.headers) this.headers = new Headers()
    this.headers?.set(name, value)
  }

  setStatus(status: HttpStatusEnum) {
    this.status = status
  }

  setStatusText(statusText: string) {
    this.statusText = statusText
  }
}

export default Responser