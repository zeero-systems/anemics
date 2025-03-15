import type { ResponserInterface } from '~/bootstraper/interfaces.ts';
import type { BodyType } from '~/bootstraper/types.ts';

import HttpStatusEnum from '~/bootstraper/enums/http-status.annotation.ts';

export class Responser implements ResponserInterface {

  raw: any;
  body: BodyType 
  headers: Headers | undefined
  status: HttpStatusEnum | undefined
  statusText: string | undefined
  metadata: Record<string | symbol, any> = {}
  
  setRaw(raw: any) {
    this.raw = raw
  }
  setBody(body: BodyType) {
    this.body = body
  }

  addMetadata(key: string | symbol, value: any): void {
    this.metadata[key] = value
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