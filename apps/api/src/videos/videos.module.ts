import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { VIDEO_QUEUE } from '@app/shared';

import { PrismaService } from '../prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { ScenesService } from '../scenes/scenes.service';
import { ElementsService } from '../elements/elements.service';

import { VideosController } from './videos.controller';

@Module({
  imports: [BullModule.registerQueue({ name: VIDEO_QUEUE })],
  controllers: [VideosController],
  providers: [PrismaService, ProjectsService, ScenesService, ElementsService],
})
export class VideosModule {}
