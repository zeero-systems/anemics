import Controller from '~/controller/annotations/Controller.ts';
import Delete from '~/controller/annotations/Delete.ts';
import Endpoint from '~/controller/annotations/Endpoint.ts';
import Get from '~/controller/annotations/Get.ts';
import Middleware from '~/controller/annotations/Middleware.ts';
import Model from '~/controller/annotations/Model.ts';
import Options from '~/controller/annotations/Options.ts';
import Patch from '~/controller/annotations/Patch.ts';
import Post from '~/controller/annotations/Post.ts';
import Put from '~/controller/annotations/Put.ts';
import Module from '~/module/annotations/Module.ts';

import isMethod from '~/server/guards/isMethod.ts';

export { default as Controller } from '~/controller/annotations/Controller.ts';
export { default as Delete } from '~/controller/annotations/Delete.ts';
export { default as Endpoint } from '~/controller/annotations/Endpoint.ts';
export { default as Get } from '~/controller/annotations/Get.ts';
export { default as Middleware } from '~/controller/annotations/Middleware.ts';
export { default as Model } from '~/controller/annotations/Model.ts';
export { default as Options } from '~/controller/annotations/Options.ts';
export { default as Patch } from '~/controller/annotations/Patch.ts';
export { default as Post } from '~/controller/annotations/Post.ts';
export { default as Put } from '~/controller/annotations/Put.ts';
export { default as Module } from '~/module/annotations/Module.ts';

import Gateway from '~/controller/services/Gateway.ts';
import Framer from '~/controller/services/Framer.ts';
import Interceptor from '~/controller/services/Interceptor.ts';
import Application from '~/server/services/Application.ts';
import Bootstraper from '~/server/services/Bootstraper.ts';
import Requester from '~/server/services/Requester.ts';
import Responser from '~/server/services/Responser.ts';

export { Gateway } from '~/controller/services/Gateway.ts';
export { Framer } from '~/controller/services/Framer.ts';
export { Interceptor } from '~/controller/services/Interceptor.ts';
export { Application } from '~/server/services/Application.ts';
export { Bootstraper } from '~/server/services/Bootstraper.ts';
export { Requester } from '~/server/services/Requester.ts';
export { Responser } from '~/server/services/Responser.ts';

import HttpStatusEnum from '~/server/enums/HttpStatusEnum.ts';

export { HttpStatusEnum } from '~/server/enums/HttpStatusEnum.ts';

import Decoder from '~/server/middlewares/Decoder.ts';
import Encoder from '~/server/middlewares/Encoder.ts';

export { Decoder } from '~/server/middlewares/Decoder.ts';
export { Encoder } from '~/server/middlewares/Encoder.ts';

export * from '~/controller/interfaces.ts';
export * from '~/controller/types.ts';
export * from '~/module/types.ts';
export * from '~/server/interfaces.ts';
export * from '~/server/types.ts';

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
  Decoder,
  Encoder,
  Application,
  Requester,
  Responser
}