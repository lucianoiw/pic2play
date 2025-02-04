import { Module } from '@nestjs/common';

import { PrismaService } from '../prisma.service';

import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';

@Module({
  controllers: [ProjectsController],
  providers: [PrismaService, ProjectsService],
})
export class ProjectsModule {}
