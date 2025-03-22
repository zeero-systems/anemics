import type { ArtifactType, ConstructorType } from '@zxxxro/commons';
import type { ControllerInterface, InterceptorInterface } from '~/controller/interfaces.ts';
import type { ModuleInterface } from '~/module/interfaces.ts';

export type ModuleParameterType<T> = ConstructorType<T> | ArtifactType

export type ModuleParametersType = {
  consumers?: Array<ModuleParameterType<any>>
  providers?: Array<ModuleParameterType<any>>
  controllers?: Array<ModuleParameterType<ControllerInterface>>
  interceptors?: Array<ModuleParameterType<InterceptorInterface>>
  modules?: Array<ModuleParameterType<ModuleInterface>>
}

export default {}