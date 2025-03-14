import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';
import { Required } from '@zxxxro/commons';

import Controller from '~/controller/annotations/Controller.ts';
import Model from '~/controller/annotations/Model.ts';
import Get from '~/controller/annotations/Get.ts';
import Options from '~/controller/annotations/Options.ts';
import Patch from '~/controller/annotations/Patch.ts';
import Put from '~/controller/annotations/Put.ts';
import Delete from '~/controller/annotations/Delete.ts';
import Module from '~/module/annotations/Module.ts';
import { PathInterface, QueryInterface, RequesterInterface, ResponserInterface } from '~/server/interfaces.ts';
import Router from '~/controller/services/Gateway.ts';

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
