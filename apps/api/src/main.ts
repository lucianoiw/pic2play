import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { CustomLogger } from '@app/shared';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useLogger(app.get(CustomLogger));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
