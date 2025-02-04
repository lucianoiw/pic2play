import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';

import { CreateElementProps } from './elements.types';

@Injectable()
export class ElementsService {
  constructor(private prisma: PrismaService) {}

  create(project_id: string, element: CreateElementProps, scene_id?: string) {
    return this.prisma.element.create({
      data: {
        project: {
          connect: {
            id: project_id,
          },
        },

        ...(scene_id && {
          scene: {
            connect: {
              id: scene_id,
            },
          },
        }),

        description: element.description,

        status: element.status,
        type: element.type,

        duration: element.duration,
        source_url: element.source_url,
      },
    });
  }
}
