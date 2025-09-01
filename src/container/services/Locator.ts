import type { KeyType } from '~/common/types.ts';
import type { ContainerInterface } from '~/container/interfaces.ts';

export class Locator {
  static containers: Map<KeyType, ContainerInterface> = new Map();

  static has(key: KeyType): boolean {
    return Locator.containers.has(key);
  }

  static set(key: KeyType, container: ContainerInterface): Map<KeyType, ContainerInterface> {
    return Locator.containers.set(key, container);
  }

  static delete(key: KeyType): boolean {
    return Locator.containers.delete(key);
  }
}

export default Locator;
