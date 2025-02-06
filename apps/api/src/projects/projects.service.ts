import { Injectable } from '@nestjs/common';

import { PrismaService } from '@app/shared';

import { Prisma, Project } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.ProjectCreateInput) {
    return this.prisma.project.create({
      data: {
        description: data.description,
        resolution: data.resolution || '1920x1080',
        quality: data.quality,
        pending_tasks: data.pending_tasks || 0,
        pending_scenes_tasks: data.pending_scenes_tasks || 0,
      },
    });
  }

  findOne(project_id: string) {
    return this.prisma.project.findUnique({
      where: {
        id: project_id,
      },

      include: {
        scenes: {
          include: {
            elements: true,
          },
        },

        elements: true,
      },
    });
  }

  update(project_id: string, data: Partial<Project>) {
    return this.prisma.project.update({
      where: {
        id: project_id,
      },

      data,
    });
  }
}
