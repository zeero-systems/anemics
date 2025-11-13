import type { ResponserInterface } from '~/network/interfaces.ts';

import HttpStatusEnum from '~/network/enums/http-status.enum.ts';

export class Responser implements ResponserInterface {
  body: BodyInit | undefined | null;
  parsed: BodyInit | null | undefined;
  headers: Record<string, string> | undefined;
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

  setHeader(name: string, value: string) {
    if (!this.headers) { 
      this.headers = {};
    }
    this.headers[name] = value;
  }

  setStatus(status: HttpStatusEnum) {
    this.status = status;
  }

  setStatusText(statusText: string) {
    this.statusText = statusText;
  }
}

export default Responser;
