import { Module } from '@nestjs/common';

import { TasksModule } from '@app/shared';

import { PrismaService } from '@app/shared';

import { ProjectsService } from '../projects/projects.service';
import { ScenesService } from '../scenes/scenes.service';
import { ElementsService } from '../elements/elements.service';

import { VideosController } from './videos.controller';

@Module({
  imports: [TasksModule],
  controllers: [VideosController],
  providers: [PrismaService, ProjectsService, ScenesService, ElementsService],
})
export class VideosModule {}
