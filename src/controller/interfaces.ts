import type { EndpointType } from '~/controller/types.ts';
import type { ContextType, NextType } from '~/server/types.ts'

export interface MiddlewareInterface {
  onRequest(endpoint: EndpointType | undefined, context: ContextType, next: NextType): Promise<void>
}