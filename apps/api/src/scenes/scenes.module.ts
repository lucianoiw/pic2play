import { Module } from '@nestjs/common';

import { PrismaService } from '@app/shared';
import { ElementsService } from '../elements/elements.service';

import { ScenesService } from './scenes.service';
import { ScenesController } from './scenes.controller';

@Module({
  controllers: [ScenesController],
  providers: [PrismaService, ScenesService, ElementsService],
})
export class ScenesModule {}
