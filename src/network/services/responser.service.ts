import type { ResponserInterface } from '~/network/interfaces.ts';

import HttpStatusEnum from '~/network/enums/http-status.enum.ts';

export class Responser implements ResponserInterface {
  body: BodyInit | undefined | null;
  parsed: BodyInit | null | undefined;
  headers: Headers | undefined;
  status: HttpStatusEnum | undefined;
  statusText: string | undefined;
  metadata: Record<string | symbol, any> = {};

  setParsed(value: BodyInit | undefined | null) {
    this.parsed = value;
  }
  setBody(value: BodyInit | undefined | null) {
    this.body = value;
  }

  addMetadata(key: string | symbol, value: any): void {
    this.metadata[key] = value;
  }

  setHeaders(headers: Headers) {
    this.headers = headers;
  }
  setHeader(name: string, value: string) {
    if (!this.headers) this.headers = new Headers();
    this.headers?.set(name, value);
  }

  setStatus(status: HttpStatusEnum) {
    this.status = status;
  }

  setStatusText(statusText: string) {
    this.statusText = statusText;
  }
}

export default Responser;
