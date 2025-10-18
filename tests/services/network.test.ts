import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import type { RequesterInterface } from '~/network/interfaces.ts';
import Http from '~/network/services/http.service.ts';

describe('server', () => {

  const debugHandler = (_requester: RequesterInterface) => {
    return Promise.resolve(new Response('42'))
  }

  it('http server', async () => {
    const httpServer = new Http({ port: 3000, hostname: '0.0.0.0' })

    await httpServer.start(debugHandler)

    const response = await fetch('http://0.0.0.0:3000');
    const responseText = await response.text();
        
    expect(responseText).toEqual('42');

    httpServer.stop()
  })

  it('websocket server', async () => {
    // @TODO
  })

})
