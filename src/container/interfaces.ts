import type { KeyType } from '~/common/types.ts';

import ScopeEnum from '~/container/enums/ScopeEnum.ts';

export interface ContainerInterface {
  instances: Map<KeyType, any>;

  construct<T>(key: KeyType, scope?: ScopeEnum): T | undefined;
}

export default {};
