import HttpStatusEnum from '~/bootstraper/enums/http-status.annotation.ts';
import { RequesterInterface, ResponserInterface } from '~/bootstraper/interfaces.ts';

export type MethodType = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'OPTIONS' | string

export type BodyType = BodyInit | undefined | null

export type BodyInitType = {
  headers?: Headers
  status?: HttpStatusEnum | undefined
  statusText?: string | undefined
}

export type ContextType<T> = {
  traceId: string | undefined
  requester: RequesterInterface
  responser: ResponserInterface
  extra: T | undefined
}

export default {}