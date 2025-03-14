import type { ComponentParametersType, ConstructorType, ProviderType } from '@zxxxro/commons';
import type { MiddlewareInterface } from '../controller/interfaces.ts';

export type ModuleParametersType = {
  middlewares?: Array<ConstructorType<MiddlewareInterface>>,
  providers?: Array<ProviderType>
  consumers?: Array<ConstructorType<any>>
}