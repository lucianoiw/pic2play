import { NestFactory } from '@nestjs/core';

import { CustomLogger } from '@app/shared';

import { QueueModule } from './queue.module';

async function bootstrap() {
  const app = await NestFactory.create(QueueModule);

  app.useLogger(app.get(CustomLogger));

  await app.listen(process.env.port ?? 3001);
}
bootstrap();
