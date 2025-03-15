import type { PathInterface, QueryInterface, RequesterInterface, ResponserInterface } from '~/bootstraper/interfaces.ts';

import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import { Required } from '@zxxxro/commons';
import Controller from '~/controller/annotations/controller.annotation.ts';
import Model from '~/controller/annotations/model.annotation.ts';
import Get from '~/controller/annotations/get.annotation.ts';
import Options from '~/controller/annotations/options.annotation.ts';
import Patch from '~/controller/annotations/patch.annotation.ts';
import Put from '~/controller/annotations/put.annotation.ts';
import Delete from '~/controller/annotations/delete.annotation.ts';
import Module from '~/module/annotations/module.annotation.ts';

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
