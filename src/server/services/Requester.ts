// deno-lint-ignore-file ban-types
import { OmitType } from '@zxxxro/commons';
import { RequesterInterface } from '~/server/interfaces.ts'

export class Requester implements RequesterInterface {
  cache!: RequestCache;
  credentials!: RequestCredentials;
  destination!: RequestDestination;
  headers!: Headers;
  integrity!: string;
  isHistoryNavigation!: boolean;
  isReloadNavigation!: boolean;
  keepalive!: boolean;
  method!: string;
  mode!: RequestMode;
  redirect!: RequestRedirect;
  referrer!: string;
  referrerPolicy!: ReferrerPolicy;
  signal!: AbortSignal;
  url!: string;
  body!: ReadableStream<Uint8Array> | null;
  bodyUsed!: boolean;

  constructor(public request: Request) {
    return new Proxy(this, {
      get: <T extends { request: Request | T }, K extends keyof OmitType<T | Request, Function>>(
        target: T, name:  K) => {
          // @ts-ignore exists on constructor
          if (name == 'request') return target.request
          return target.request[name]
        }
    })
  }

  clone(): Request {
    return this.request.clone()
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    return this.request.arrayBuffer()
  }

  blob(): Promise<Blob> {
    return this.request.blob()
  }

  bytes(): Promise<Uint8Array> {
    return this.request.bytes()
  }
  
  formData(): Promise<FormData> {
    return this.request.formData()
  }

  json(): Promise<any> {
    return this.request.json()
  }

  text(): Promise<string> {
    return this.request.text()
  }
}

export default Requester