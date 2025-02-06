import { Module } from '@nestjs/common';

import { PrismaService } from '@app/shared';

import { ScenesService } from './scenes.service';
import { ScenesController } from './scenes.controller';

@Module({
  controllers: [ScenesController],
  providers: [PrismaService, ScenesService],
})
export class ScenesModule {}
