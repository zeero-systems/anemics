import type { ResponseInterface } from '~/network/interfaces.ts';

import HttpStatusEnum from '~/network/enums/http-status.enum.ts';

export class Response implements ResponseInterface {

  raw: any;
  body: BodyInit | undefined | null 
  headers: Headers | undefined
  status: HttpStatusEnum | undefined
  statusText: string | undefined
  metadata: Record<string | symbol, any> = {}
  
  setRaw(raw: any) {
    this.raw = raw
  }
  setBody(body: BodyInit | undefined | null) {
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

export default Response