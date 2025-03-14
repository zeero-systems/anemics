import Controller from '~/controller/annotations/Controller.ts';
import Module from '~/module/annotations/Module.ts';
import Bootstraper from '~/server/services/Bootstraper.ts';
import Model from '~/controller/annotations/Model.ts';
import Post from '~/controller/annotations/Post.ts';
import { Artifact,Required, ValidationEnum } from '@zxxxro/commons';
import { ContextType, NextType } from '~/server/types.ts';
import { MiddlewareInterface } from '~/controller/interfaces.ts';
import { ResponserInterface } from '~/server/interfaces.ts';
import { EndpointType } from '~/controller/types.ts';
import Get from '~/controller/annotations/Get.ts';
import Decoder from '~/server/middlewares/Decoder.ts';
import Router from '~/controller/middlewares/Router.ts';
import Encoder from '~/server/middlewares/Encoder.ts';
import Middleware from '~/controller/annotations/Middleware.ts';

@Model()
class User {
  name!: string;
}

@Model()
class UserFilter {
  @Required()
  id!: number;
}

@Middleware('middle', 'ordered')
class Validator implements MiddlewareInterface {
  static weigth = 0;
  async onRequest(endpoint: EndpointType | undefined, context: ContextType, next: NextType): Promise<void> {
    if (endpoint) {
      if (context.metadata.model) {
        const onlyInvalids = [
          ValidationEnum.INVALID,
          ValidationEnum.UNGUARDED,
          ValidationEnum.EXCEPTION,
          ValidationEnum.ERROR,
        ];
        const validationErrors = await Artifact.validateProperties(context.metadata.model, onlyInvalids);

        if (validationErrors) {
          context.responser.setBody(JSON.stringify(validationErrors));
          context.responser.setStatus(400);

          context.responser.setHeader('Content-Type', 'application/json');

          return;
        }
      }
    }

    return next();
  }
}

@Middleware('after', 'ordered')
class Logger implements MiddlewareInterface {
  async onRequest(endpoint: EndpointType | undefined, context: ContextType, next: NextType): Promise<void> {
    (async () => {
      console.log(
        `[${endpoint?.handler.method}] ${endpoint?.controller.path ? `${endpoint?.controller.path}/` : ''}${
          endpoint?.handler.path ?? ''
        }`,
      );
    })();
    
    return next();
  }
}

class UserService {
  async getUserList(): Promise<Array<User>> {
    return [{ name: 'Eduardo' }];
  }

  async getUser(): Promise<User> {
    return { name: 'Eduardo' };
  }
}

@Controller('user')
class UserController {
  constructor(public userService: UserService) {}

  @Get()
  async getUsers(userFilter: UserFilter, context: ContextType): Promise<string> {
    context.responser.setHeader('Content-Type', 'text/html');

    return `<div><b>[{ name: 'Eduardo' }]</b><div>`;
  }

  @Post()
  async postUser(formData: FormData, responser: ResponserInterface): Promise<void> {
    responser.setBody(formData);
    responser.setStatus(201);
  }
}

@Module({
  providers: [UserService],
})
class UserModule {
  constructor(public userService: UserService) {}
}

@Module({
  middlewares: [Logger, Decoder, Validator, Router, Encoder],
})
class AppModule {
  constructor(public userModule: UserModule) {}
}

async function bootstrap() {
  const app = Bootstraper.create(AppModule);
  await app.listen({ port: 3000 }, app.handler);
}

bootstrap();
