import Controller from '~/controller/annotations/controller.annotation.ts';
import Delete from '~/controller/annotations/delete.annotation.ts';
import Endpoint from '~/controller/annotations/endpoint.annotation.ts';
import Get from '~/controller/annotations/get.annotation.ts';
import Middleware from '~/controller/annotations/middleware.annotation.ts';
import Model from '~/controller/annotations/model.annotation.ts';
import Options from '~/controller/annotations/options.annotation.ts';
import Patch from '~/controller/annotations/patch.annotation.ts';
import Post from '~/controller/annotations/post.annotation.ts';
import Put from '~/controller/annotations/put.annotation.ts';
import Module from '~/module/annotations/module.annotation.ts';

import isMethod from '~/bootstraper/guards/is-method.guard.ts';

export { default as Controller } from '~/controller/annotations/controller.annotation.ts';
export { default as Delete } from '~/controller/annotations/delete.annotation.ts';
export { default as Endpoint } from '~/controller/annotations/endpoint.annotation.ts';
export { default as Get } from '~/controller/annotations/get.annotation.ts';
export { default as Middleware } from '~/controller/annotations/middleware.annotation.ts';
export { default as Model } from '~/controller/annotations/model.annotation.ts';
export { default as Options } from '~/controller/annotations/options.annotation.ts';
export { default as Patch } from '~/controller/annotations/patch.annotation.ts';
export { default as Post } from '~/controller/annotations/post.annotation.ts';
export { default as Put } from '~/controller/annotations/put.annotation.ts';
export { default as Module } from '~/module/annotations/module.annotation.ts';

import Gateway from '~/controller/services/gateway.service.ts';
import Framer from '~/controller/services/framer.service.ts';
import Interceptor from '~/controller/services/interceptor.service.ts';
import Application from '~/bootstraper/services/application.service.ts';
import Bootstraper from '~/bootstraper/services/bootstraper.service.ts';
import Requester from '~/bootstraper/services/requester.service.ts';
import Responser from '~/bootstraper/services/responser.service.ts';

export { Gateway } from '~/controller/services/gateway.service.ts';
export { Framer } from '~/controller/services/framer.service.ts';
export { Interceptor } from '~/controller/services/interceptor.service.ts';
export { Application } from '~/bootstraper/services/application.service.ts';
export { Bootstraper } from '~/bootstraper/services/bootstraper.service.ts';
export { Requester } from '~/bootstraper/services/requester.service.ts';
export { Responser } from '~/bootstraper/services/responser.service.ts';

import HttpStatusEnum from '~/bootstraper/enums/http-status.annotation.ts';

export { HttpStatusEnum } from '~/bootstraper/enums/http-status.annotation.ts';

import RouterInterceptor from '~/controller/interceptors/router.interceptor.ts';

export { RouterInterceptor } from '~/controller/interceptors/router.interceptor.ts';

export * from '~/controller/interfaces.ts';
export * from '~/controller/types.ts';
export * from '~/module/types.ts';
export * from '~/bootstraper/interfaces.ts';
export * from '~/bootstraper/types.ts';

export const Guards = {
  isMethod
}

export default {
  Controller,
  Delete,
  Endpoint,
  Get,
  Bootstraper,
  Middleware,
  Model,
  Options,
  Patch,
  Post,
  Put,
  Module,
  Gateway,
  Framer,
  Interceptor,
  HttpStatusEnum,
  Guards,
  Application,
  Requester,
  Responser,
  RouterInterceptor
}