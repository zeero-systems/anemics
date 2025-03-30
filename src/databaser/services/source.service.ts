import { SourceOptionsType } from '~/databaser/types.ts';
import { AdapterInterface, ConnectionInterface, SourceInterface } from '~/databaser/interfaces.ts';
import { ConstructorType, Factory } from '@zxxxro/commons';
import { PostgresAdapter } from '~/databaser/adapters/postgres/postgres.adapter.ts';
import { AdapterEnum } from '~/databaser/enums/AdapterEnum.ts';

export class Source implements SourceInterface {

  public adapter: AdapterInterface
  public adapters: Map<AdapterEnum, ConstructorType<AdapterInterface>> = new Map([
    [AdapterEnum.Postgres, PostgresAdapter]
  ])

  constructor(public options: SourceOptionsType) {
    // @ts-ignore we know for sure that exists
    this.adapter = Factory.construct<AdapterInterface>(this.adapters.get(options.common.adapter), {
      arguments: {
        construct: [ options.common, options.options, options.extra ]
      }
    })
  }

  async connection(): Promise<ConnectionInterface> {
    return this.adapter.connection()
  }
}