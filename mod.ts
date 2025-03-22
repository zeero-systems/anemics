import Controller from '~/controller/annotations/controller.annotation.ts';
import Delete from '~/controller/annotations/delete.annotation.ts';
import Endpoint from '~/controller/annotations/endpoint.annotation.ts';
import Get from '~/controller/annotations/get.annotation.ts';
import Intercept from './src/controller/annotations/intercept.annotation.ts';
import Model from '~/controller/annotations/model.annotation.ts';
import Module from '~/module/annotations/module.annotation.ts';
import Options from '~/controller/annotations/options.annotation.ts';
import Patch from '~/controller/annotations/patch.annotation.ts';
import Post from '~/controller/annotations/post.annotation.ts';
import Put from '~/controller/annotations/put.annotation.ts';

import isMethod from '~/bootstraper/guards/is-method.guard.ts';

export { default as Controller } from '~/controller/annotations/controller.annotation.ts';
export { default as Delete } from '~/controller/annotations/delete.annotation.ts';
export { default as Endpoint } from '~/controller/annotations/endpoint.annotation.ts';
export { default as Get } from '~/controller/annotations/get.annotation.ts';
export { default as Intercept } from './src/controller/annotations/intercept.annotation.ts';
export { default as Model } from '~/controller/annotations/model.annotation.ts';
export { default as Module } from '~/module/annotations/module.annotation.ts';
export { default as Options } from '~/controller/annotations/options.annotation.ts';
export { default as Patch } from '~/controller/annotations/patch.annotation.ts';
export { default as Post } from '~/controller/annotations/post.annotation.ts';
export { default as Put } from '~/controller/annotations/put.annotation.ts';

import { Controller as ControllerAnnotation } from '~/controller/annotations/controller.annotation.ts';
import { Delete as DeleteAnnotation } from '~/controller/annotations/delete.annotation.ts';
import { Endpoint as EndpointAnnotation } from '~/controller/annotations/endpoint.annotation.ts';
import { Get as GetAnnotation } from '~/controller/annotations/get.annotation.ts';
import { Intercept as InterceptAnnotation } from './src/controller/annotations/intercept.annotation.ts';
import { Model as ModelAnnotation } from '~/controller/annotations/model.annotation.ts';
import { Module as ModuleAnnotation } from '~/module/annotations/module.annotation.ts';
import { Options as OptionsAnnotation } from '~/controller/annotations/options.annotation.ts';
import { Patch as PatchAnnotation } from '~/controller/annotations/patch.annotation.ts';
import { Post as PostAnnotation } from '~/controller/annotations/post.annotation.ts';
import { Put as PutAnnotation } from '~/controller/annotations/put.annotation.ts';

import Gateway from '~/controller/services/gateway.service.ts';
import Interceptor from '~/controller/services/interceptor.service.ts';
import Application from '~/bootstraper/services/application.service.ts';
import Bootstraper from '~/bootstraper/services/bootstraper.service.ts';
import Requester from '~/bootstraper/services/requester.service.ts';
import Responser from '~/bootstraper/services/responser.service.ts';

export { Gateway } from '~/controller/services/gateway.service.ts';
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
export * from '~/module/interfaces.ts';
export * from '~/module/types.ts';
export * from '~/bootstraper/interfaces.ts';
export * from '~/bootstraper/types.ts';

export const Guards = {
  isMethod
}

export const Annotations = {
  Controller: ControllerAnnotation,
  Delete: DeleteAnnotation,
  Endpoint: EndpointAnnotation,
  Get: GetAnnotation,
  Intercept: InterceptAnnotation,
  Model: ModelAnnotation,
  Module: ModuleAnnotation,
  Options: OptionsAnnotation,
  Patch: PatchAnnotation,
  Post: PostAnnotation,
  Put: PutAnnotation ,
}

export default {
  Annotations,
  Application,
  Bootstraper,
  Controller,
  Delete,
  Endpoint,
  Gateway,
  Get,
  Guards,
  HttpStatusEnum,
  Intercept,
  Interceptor,
  Model,
  Module,
  Options,
  Patch,
  Post,
  Put,
  Requester,
  Responser,
  RouterInterceptor,
}