import { QuerierInterface, RawwerInterface } from '~/querier/interfaces.ts';
import Raw from '~/querier/adapters/sql/raw.service.ts';

export class Rawwer implements RawwerInterface {
  constructor(protected query: QuerierInterface) { }

  text(value: string): QuerierInterface {
    this.query.useClause(new Raw(value))
    return this.query
  }
}

export default Rawwer