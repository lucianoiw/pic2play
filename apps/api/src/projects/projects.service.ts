import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';

import { CreateProjectProps } from '@app/shared/types';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateProjectProps) {
    return this.prisma.project.create({
      data: {
        description: data.description,
        resolution: data.resolution || '1920x1080',
        quality: data.quality,
        status: data.status,
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
}
