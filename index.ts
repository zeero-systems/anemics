import Module from '~/module/annotations/module.annotation.ts';
import Bootstraper from '~/bootstraper/services/bootstraper.service.ts';
import Controller from '~/controller/annotations/controller.annotation.ts';
import Get from '~/controller/annotations/get.annotation.ts';

@Controller()
class AnyController {
  @Get('health')
  public getStatus() { return 'OK' }

  @Get('user')
  public getUser() {
    throw new Error("Database gonne away"); 
  }
}

@Module({
  controllers: [AnyController]
})
class AppModule {
  constructor() {}
}

async function bootstrap() {
  const app = Bootstraper.create(AppModule);

  await app.listen({ port: 3000 }, app.handler);
}

bootstrap();