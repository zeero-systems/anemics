import type { ContextType, NextType } from '~/application/types.ts'

export interface ControllerInterface {}

export interface InterceptorInterface {
  onUse<T>(context: ContextType<T>, next: NextType): Promise<void>
}

export default {}