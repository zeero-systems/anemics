import type { RequesterInterface } from '~/network/interfaces.ts';

export class Requester<T = BodyInit> extends Request implements RequesterInterface<T> {
  parsed: T | null | undefined;

  constructor(request: Request) {
    super(request)
  }
}

export default Requester