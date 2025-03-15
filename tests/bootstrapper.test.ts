import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import Bootstraper from '~/bootstraper/services/bootstraper.service.ts';
import Module from '~/module/annotations/module.annotation.ts';

describe('bootstraper', () => {
  
  @Module()
  class AppModule {
    constructor() {}
  }

  it('create app', () => {
    const app = Bootstraper.create(AppModule);
  });

  it('run handler', () => {
    const app = Bootstraper.create(AppModule);

    app.handler(new Request('http://localhost:3000'))
  });

});
