// deno-lint-ignore-file no-this-alias
import type { ContainerInterface } from '~/container/interfaces.ts';
import type { ArtifactType, KeyType, TagType } from '~/common/types.ts';

import { Consume } from '~/container/annotations/Consume.ts';
import { Provider } from '~/container/annotations/Provider.ts';
import { Consumer } from '~/container/annotations/Consumer.ts';

import Artifactor from '~/common/services/Artifactor.ts';
import Decorator from '~/decorator/services/Decorator.ts';
import Factory from '~/common/services/Factory.ts';
import Locator from '~/container/services/Locator.ts';
import Text from '~/common/services/Text.ts';
import ScopeEnum from '~/container/enums/ScopeEnum.ts';

import isClass from '~/common/guards/isClass.ts';

export class Container implements ContainerInterface {
  public static artifacts: Map<KeyType, ArtifactType> = new Map();
  public static artifactsByTag: Map<TagType, Map<KeyType, ArtifactType>> = new Map();

  public instances: Map<KeyType, any> = new Map();

  constructor() {
    if (
      Artifactor.artifacts.size > 0 &&
      Container.artifacts.size == 0
    ) {
      const self = this;

      for (const [key, artifact] of Artifactor.artifacts) {
        if (artifact.tags?.includes(Consumer.tag)) {
          if (isClass(artifact.target)) {
            artifact.target = new Proxy(artifact.target, {
              construct(currentTarget: any, currentArgs: any, newTarget: any) {
                currentTarget = self.applyConstructProxy(currentTarget, currentArgs, newTarget);

                currentTarget = new Proxy(currentTarget, {
                  get(currentTarget: any, currentPropertyKey: any, currentReceiver: any) {
                    return self.applyGetProxy(currentTarget, currentPropertyKey, currentReceiver);
                  },
                });

                return currentTarget;
              },
            });
          }
        }

        Container.artifacts.set(key, artifact);

        for (const tag of artifact.tags || []) {
          if (!Container.artifactsByTag.has(tag)) {
            Container.artifactsByTag.set(tag, new Map());
          }

          // @ts-ignore we already added the scoped target
          Container.artifactsByTag.get(tag)?.set(key, artifact);
        }
      }
    }
  }

  private applyGetProxy(currentTarget: any, currentPropertyKey: any, currentReceiver: any) {
    const consume = Decorator.getDecoration(currentTarget, Consume, currentPropertyKey);

    if (consume) {
      let scope = ScopeEnum.Transient;
      if (consume.parameters.scope) {
        scope = consume.parameters.scope;
      }

      let providerName = currentPropertyKey;
      if (consume.parameters.provider) {
        providerName = consume.parameters.provider;
        if (isClass(consume.parameters.provider)) {
          providerName = consume.parameters.provider.name;
        }
      }

      providerName = Text.toFirstLetterUppercase(providerName);

      if (Container.artifactsByTag.get(Provider.tag)?.has(providerName)) {
        return this.construct(providerName, scope);
      }
    }

    return Reflect.get(currentTarget, currentPropertyKey, currentReceiver);
  }

  private applyConstructProxy(currentTarget: any, currentArgs: any, newTarget: any) {
    if (currentTarget.prototype !== newTarget.prototype) {
      return Reflect.construct(currentTarget, currentArgs, newTarget);
    }

    const parameters = Factory.getParameters(currentTarget);

    if (parameters) {
      let scope = ScopeEnum.Transient;
      if (currentTarget[Symbol.metadata]) {
        if (currentTarget[Symbol.metadata]?.scope) {
          scope = currentTarget[Symbol.metadata]?.scope as any;
        }
      }

      for (let index = 0; index < parameters.length; index++) {
        const providerName = Text.toFirstLetterUppercase(parameters[index]);
        if (Container.artifactsByTag.get(Provider.tag)?.has(providerName)) {
          currentArgs[index] = this.construct(providerName, scope);
        }
      }
    }

    return Reflect.construct(currentTarget, currentArgs, newTarget);
  }

  public construct<T>(key: KeyType, scope: ScopeEnum = ScopeEnum.Transient): T | undefined {
    const artifact = Container.artifacts.get(key);

    if (artifact && isClass(artifact.target)) {
      if (scope == ScopeEnum.Perpetual) {
        if (Locator.containers.has('Perpetual')) {
          return Locator.containers.get('Perpetual')
            ?.construct(key, ScopeEnum.Transient) as T;
        }
      }

      if (scope == ScopeEnum.Ephemeral) {
        return Factory.construct(artifact.target as any);
      }

      if (scope == ScopeEnum.Transient) {
        if (!this.instances.has(key)) {
          this.instances.set(key, Factory.construct(artifact.target));
        }
        return this.instances.get(key);
      }
    }

    return artifact?.target as T;
  }

  static create(key: KeyType): ContainerInterface {
    return Locator.containers.set(key, new Container()).get(key) as ContainerInterface;
  }
}

export default Container;
