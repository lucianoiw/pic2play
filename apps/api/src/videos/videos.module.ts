import { Module } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { ScenesService } from '../scenes/scenes.service';
import { ElementsService } from '../elements/elements.service';

import { VideosController } from './videos.controller';

@Module({
  controllers: [VideosController],
  providers: [PrismaService, ProjectsService, ScenesService, ElementsService],
})
export class VideosModule {}
