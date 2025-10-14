import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import Patch from '~/controller/decorations/patch.decoration.ts';
import Post from '~/controller/decorations/post.decoration.ts';
import Controller from '~/controller/decorations/controller.decoration.ts';
import Put from '~/controller/decorations/put.decoration.ts';
import Delete from '~/controller/decorations/delete.decoration.ts';
import Options from '~/controller/decorations/options.decoration.ts';
import Router from '~/controller/services/router.service.ts';

describe('controller', () => {

  @Controller('/users')
  class UserController {
    
    @Post()
    createUser() {}

    @Patch()
    updateUser() {}

    @Put()
    setUser() {}

    @Delete()
    deleteUser() {}

    @Options()
    optionsUser() {}
  }

  const router = new Router([{ name: 'UserController', target: UserController }])

  it('should have post routes', () => {
    const routes = router.routes.post

    expect(routes.length).toEqual(1)
  });

  it('should have patch routes', () => {
    const routes = router.routes.patch

    expect(routes.length).toEqual(1)
  });

  it('should have put routes', () => {
    const routes = router.routes.put

    expect(routes.length).toEqual(1)
  });

  it('should have delete routes', () => {
    const routes = router.routes.delete

    expect(routes.length).toEqual(1)
  });

  it('should have options routes', () => {
    const routes = router.routes.options

    expect(routes.length).toEqual(1)
  });

});
