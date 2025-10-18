import type { DatabaseInterface, PersisterInterface } from '~/persister/interfaces.ts';
import type { ClientOptionsType, CommonOptionsType } from '~/persister/types.ts';

import Memory from '~/persister/memory/memory.database.ts';
import Postgresql from '~/persister/postgresql/postgresql.database.ts';

export class Persister implements PersisterInterface {

  constructor(
    public common: CommonOptionsType,
    public options: ClientOptionsType,
    public extra?: any,
  ) {}

  public instantiate(): DatabaseInterface {
    if (this.common.syntax == 'postgresql') {
      return new Postgresql(this.common, this.options, this.extra)
    }

    return new Memory(this.common, this.options, this.extra)
  }
}

export default Persister