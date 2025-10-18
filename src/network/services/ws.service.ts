import type { ServerInterface } from '~/network/interfaces.ts';
import type { ServerOptionsType, SocketHandlerType } from '~/network/types.ts';
import MethodEnum from '~/network/enums/method.enum.ts';

export class Ws implements ServerInterface {
  accepts: Array<MethodEnum> = [MethodEnum.SOCKET];
  public server!: Deno.HttpServer

  constructor(public options: ServerOptionsType) {}

  async start(handler: SocketHandlerType): Promise<void> {
    this.server = await Deno.serve(this.options, (request: any): Promise<Response> => {
      if (request.headers.get("upgrade") != "websocket") {
        return Promise.resolve(new Response(null, { status: 426 }))
      }

      const { socket, response } = Deno.upgradeWebSocket(request);

      handler(request, socket)

      return Promise.resolve(response);
    });
  }

  async stop(): Promise<void> {
    return await this.server.shutdown()
  }
}

export default Ws
