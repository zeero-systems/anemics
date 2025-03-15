import type { ContextType } from '~/bootstraper/types.ts'

export interface ControllerInterface {}

export interface InterceptorInterface {
  onUse<T>(context: ContextType<T>): Promise<void>
}

export default {}