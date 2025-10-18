import type { QuerierOptionsType } from '~/querier/types.ts';
import type { IndexQuerierInterface, QuerierInterface, QueryQuerierInterface, TableQuerierInterface } from '~/querier/interfaces.ts';

import Index from '~/querier/postgresql/queries/index.querier.ts';
import Query from '~/querier/postgresql/queries/query.querier.ts';
import Table from '~/querier/postgresql/queries/table.querier.ts';

export class Querier implements QuerierInterface {
  constructor(public options: QuerierOptionsType) {}

  get query(): QueryQuerierInterface {
    if (this.options.syntax == 'postgresql') {
      return new Query({ args: [], text: '', placeholder: '$', placeholderType: 'counter', ...this.options });
    }

    throw new Error('Query not implemented');
  }

  get index(): IndexQuerierInterface {
    if (this.options.syntax == 'postgresql') {
      return new Index({ args: [], text: '', placeholder: '$', placeholderType: 'counter', ...this.options });
    }

    throw new Error('Index not implemented');
  }

  get table(): TableQuerierInterface {
    if (this.options.syntax == 'postgresql') {
      return new Table({ args: [], text: '', placeholder: '$', placeholderType: 'counter', ...this.options });
    }

    throw new Error('Table not implemented');
  }
}

export default Querier;
