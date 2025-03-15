import Bootstraper from '~/application/services/bootstraper.service.ts';
import AppModule from '~/temp/app/app.module.ts';

async function bootstrap() {
  const app = Bootstraper.create(AppModule);
  await app.listen({ port: 3000 }, app.handler);
}

bootstrap();
