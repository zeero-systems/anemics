
import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import Module from '~/module/annotations/module.annotation.ts';
import { Guards, Metadata, Container, Locator } from '@zxxxro/commons'

describe('module', () => {

  class NonProviderMock {
    public getName() {
      return 'NonProvider'
    }
  }
  
  class NonConsumerMock {
    constructor(public nonProviderMock: NonProviderMock) {}
  }
  
  @Module()
  class EmptyApp {}
  
  @Module()
  class ProviderApp {}
  
  @Module({
    providers: [NonProviderMock]
  })
  class ConsumerApp {
    constructor(public nonProviderMock: NonProviderMock) {}
  }
  
  @Module({
    consumers: [NonConsumerMock]
  })
  class ProviderConsumerApp {
    constructor(
      public nonProviderMock: NonProviderMock,
      public nonConsumerMock: NonConsumerMock,
    ) { }
  }
  
  @Module({
    providers: [ProviderConsumerApp]
  })
  class AnotherProviderConsumerApp {
    constructor(public providerConsumerApp: ProviderConsumerApp) {}
  }

  @Module({
    providers: [
      { name: 'Obj', target: ProviderConsumerApp  }
    ]
  })
  class ObjectProviderConsumerApp {
    constructor(public obj: ProviderConsumerApp) {}
  }

  it('check annotation', () => {
    const appModule = new EmptyApp()
    const metadata = Metadata.get(appModule);
    
    expect(() => {
      if (Guards.isDecoratorMetadata(metadata)) {
        return metadata.get('contructor')?.find(decoration => {
          // @ts-ignore name property
          return decoration.annotation.name == 'Module'
        })
      }
      return false
    })
  });

  const container = Container.create('NEW')

  it('apply providers', () => {
    const consumerApp = container.construct('ConsumerApp')
    
    expect(container.instances.get("NonProviderMock")).not.toBeUndefined()
  })
  
  it('inject providers', () => {
    const consumerApp = container.construct<ConsumerApp>('ConsumerApp')
    expect(consumerApp?.nonProviderMock.getName()).not.toBeUndefined()
  })
  
  it('inject consumer and providers', () => {
    const providerConsumerApp = container.construct<ProviderConsumerApp>('ProviderConsumerApp')
    
    expect(providerConsumerApp?.nonProviderMock.getName()).not.toBeUndefined()
    expect(providerConsumerApp?.nonConsumerMock?.nonProviderMock).toBeUndefined()
  })
  
  it('inject another module', () => {
    const anotherProviderConsumerApp = container.construct<AnotherProviderConsumerApp>('AnotherProviderConsumerApp')
    
    expect(anotherProviderConsumerApp?.providerConsumerApp.nonProviderMock.getName()).not.toBeUndefined()
  })
  
  it('inject another module', () => {
    const objectProviderConsumerApp = container.construct<ObjectProviderConsumerApp>('ObjectProviderConsumerApp')
    
    expect(objectProviderConsumerApp?.obj.nonConsumerMock?.nonProviderMock.getName()).toBeUndefined()
  })

});
