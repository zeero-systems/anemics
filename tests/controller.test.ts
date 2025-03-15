import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';
import { Required } from '@zxxxro/commons';

import Controller from '../src/controller/annotations/controller.annotation.ts';
import Model from '../src/controller/annotations/model.annotation.ts';
import Get from '../src/controller/annotations/get.annotation.ts';
import Options from '../src/controller/annotations/options.annotation.ts';
import Patch from '../src/controller/annotations/patch.annotation.ts';
import Put from '../src/controller/annotations/put.annotation.ts';
import Delete from '../src/controller/annotations/delete.annotation.ts';
import Module from '../src/module/annotations/module.annotation.ts';
import { PathInterface, QueryInterface, RequesterInterface, ResponserInterface } from '../src/application/interfaces.ts';
import Router from '../src/controller/services/gateway.service.ts';

describe('controller', () => {
  
  @Model()
  class CreatePost {
    title!: string
  }

  @Model()
  class PutPost {
    @Required()
    id!: string
    title!: string
  }

  @Model()
  class PatchPost {
    @Required()
    id!: string
    title!: string
  }
  
  @Controller('posts')
  class PostController {
    @Get()
    public getPosts(requester: RequesterInterface, responser: ResponserInterface) {}

    @Options()
    public getPostOptions(query: QueryInterface) {}

    @Patch()
    public patchPost(patchPost: PatchPost) {}

    @Put(':id')
    public putPost(putPost: PutPost) {}

    @Put(':id')
    public putPost2(putPost: PutPost) {}

    @Delete(':id')
    public deletePost(path: PathInterface) {}
  }
  
  it('endpoint annotations', () => {
    
  });

  @Module()
  class AppModule {
    constructor() {}
  }

});
