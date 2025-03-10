import { Module } from '@nestjs/common';

import { PrismaService } from '@app/shared';

import { ElementsService } from './elements.service';
import { ElementsController } from './elements.controller';

@Module({
  controllers: [ElementsController],
  providers: [PrismaService, ElementsService],
})
export class ElementsModule {}
