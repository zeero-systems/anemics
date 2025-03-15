import type { ModuleInterface } from '~/module/interfaces.ts';
import type { ControllerInterface, InterceptorInterface } from '~/controller/interfaces.ts';
import type { ConstructorType, ProviderType } from '@zxxxro/commons';

export type ModuleParametersType = {
  consumers?: Array<ConstructorType<any>>
  controllers?: Array<ConstructorType<ControllerInterface>>,
  middlewares?: Array<ConstructorType<InterceptorInterface>>,
  modules?: Array<ConstructorType<ModuleInterface>>,
  providers?: Array<ProviderType>
}

export default {}