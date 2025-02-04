import { Module } from '@nestjs/common';

import { PrismaService } from '@app/shared';

import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';

@Module({
  controllers: [ProjectsController],
  providers: [PrismaService, ProjectsService],
})
export class ProjectsModule {}
