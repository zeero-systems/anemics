
import type { QuerierOptionsType } from '~/querier/types.ts';
import type { IndexInterface, QuerierInterface, EntryInterface, TableInterface } from '~/querier/interfaces.ts';

import Entry from '~/querier/services/entry.service.ts';
import Index from '~/querier/services/index.service.ts';
import Table from '~/querier/services/table.service.ts';

export class Querier implements QuerierInterface {
  constructor (public options: Partial<QuerierOptionsType> & Pick<QuerierOptionsType, 'text' | 'placeholder' | 'placeholderType'> = { text: '', placeholderType: 'counter' }) {}

  get entry(): EntryInterface { return new Entry({ args: [], ...this.options, steps: [] }) }
  get index(): IndexInterface { return new Index({ args: [], ...this.options, steps: [] }) }
  get table(): TableInterface { return new Table({ args: [], ...this.options, steps: [] }) }
}

export default Querier
