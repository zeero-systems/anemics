import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import Provider, { Provider as ProviderAnnotation } from '~/container/annotations/Provider.ts';
import ScopeEnum from '~/container/enums/ScopeEnum.ts';
import Container from '~/container/services/Container.ts';
import Artifactor from '~/common/services/Artifactor.ts';
import Consumer from '~/container/annotations/Consumer.ts';
import Consume from '~/container/annotations/Consume.ts';

describe('container', () => {

  interface UserMockInterface {
    getUserFirstName(): string
  }

  @Provider()
  class UserMock implements UserMockInterface {
    public getUserFirstName(): string {
      return 'Eduardo'
    }
  }

  @Provider()
  class UserRepositoryMock {
    public getUser(): any {
      return { name: 'Eduardo' }
    }
  }

  @Provider()
  @Consumer(ScopeEnum.Transient)
  class UserServiceMock {
    constructor(public userRepositoryMock: UserRepositoryMock) {}
  }

  @Provider()
  @Consumer(ScopeEnum.Transient)
  class CustomServiceMock {
    constructor(public CUSTOM: any) {}
  }

  @Provider()
  @Consumer(ScopeEnum.Transient)
  class PropertyMock {
    constructor(public CUSTOM: any) {}
  }

  @Consumer()
  class AnotherServiceMock {
    @Consume()
    userRepositoryMock!: UserRepositoryMock

    @Consume(PropertyMock)
    differentePropertyName!: PropertyMock

    @Consume('CUSTOM')
    textPropertyName!: any
  }

  const customArtifact = { 
    name: 'Custom', 
    target: { email: 'test@email.com' },
    tags: [ProviderAnnotation.tag]
  }

  Artifactor.set('CUSTOM', customArtifact)

  const containerPerpetual = Container.create('PERPETUAL')

  it('instantiate from container', () => {
    const user = containerPerpetual.construct('UserMock')
    expect(user).not.toBeUndefined()
  });

  it('inject contructor parameters', () => {
    const user = containerPerpetual.construct<UserServiceMock>('UserServiceMock')
    expect(user?.userRepositoryMock.getUser()).not.toBeUndefined()
  });

  const containerRequest = Container.create('REQUEST')

  it('inject custom contructor parameters', () => {
    const service = containerRequest.construct<CustomServiceMock>('CustomServiceMock')
    expect(service?.CUSTOM).not.toBeUndefined()
  });
  
  it('container isolation', () => {
    containerRequest.construct<CustomServiceMock>('UserMock')
    expect(!containerPerpetual.instances.has('CustomServiceMock')).toBe(true)
  })

  const another = containerRequest.construct<AnotherServiceMock>('AnotherServiceMock')

  it('inject from field properties', () => {
    expect(another?.userRepositoryMock.getUser().name).toEqual('Eduardo')
  });

  it('inject from field properties from class', () => {
    expect(another?.differentePropertyName.CUSTOM).not.toBeUndefined()
  });

  it('inject from field properties from text', () => {
    expect(another?.textPropertyName.email).toEqual('test@email.com')
  });
});
