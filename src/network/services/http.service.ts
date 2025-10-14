import type { ServerInterface } from '~/network/interfaces.ts';
import type { HttpHandlerType, ServerOptionsType } from '~/network/types.ts';
import MethodEnum from '~/network/enums/method.enum.ts';

export class Http implements ServerInterface {
  public accepts: Array<MethodEnum> = [
    MethodEnum.CONNECT,
    MethodEnum.DELETE,
    MethodEnum.GET,
    MethodEnum.HEAD,
    MethodEnum.OPTIONS,
    MethodEnum.PATCH,
    MethodEnum.PUT,
    MethodEnum.POST,
    MethodEnum.TRACE,
  ]
  public server!: Deno.HttpServer

  constructor(public options: ServerOptionsType) {}

  async start(handler: HttpHandlerType): Promise<void> {
    this.server = Deno.serve(this.options, handler);
  }

  async stop(): Promise<void> {
    return this.server.shutdown()
  }
}

export default Http
