import { Injectable } from '@nestjs/common';

import { PrismaService } from '@app/shared';

import { CreateSceneProps } from '@app/shared/types';

@Injectable()
export class ScenesService {
  constructor(private prisma: PrismaService) {}

  async create(
    project_id: string,
    { description, status, duration, elements }: CreateSceneProps,
  ) {
    const scene = await this.prisma.scene.create({
      data: {
        project: {
          connect: {
            id: project_id,
          },
        },

        description,
        status,
        duration,
        pending_tasks: elements?.length || 0,

        elements: {
          createMany: {
            data: elements?.map(
              ({ description, type, duration, source_url }) => ({
                project_id,
                description,
                type,
                duration,
                source_url,
              }),
            ),
          },
        },
      },

      include: {
        elements: true,
      },
    });

    return scene;
  }
}
