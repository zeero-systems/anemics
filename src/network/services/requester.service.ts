import type { RequesterInterface } from '~/network/interfaces.ts';

export class Requester extends Request implements RequesterInterface {
  parsed: BodyInit | null | undefined;

  constructor(request: Request) {
    super(request)
  }
}

export default Requester