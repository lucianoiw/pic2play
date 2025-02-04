import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { ElementsService } from '../elements/elements.service';

import { CreateSceneProps } from '@app/shared/types';

@Injectable()
export class ScenesService {
  constructor(
    private prisma: PrismaService,
    private readonly elementsService: ElementsService,
  ) {}

  async create(project_id: string, { elements, ...data }: CreateSceneProps) {
    const scene = await this.prisma.scene.create({
      data: {
        project: {
          connect: {
            id: project_id,
          },
        },

        description: data.description,
        status: data.status,
        duration: data.duration,
      },

      include: {
        elements: true,
      },
    });

    if (elements?.length) {
      await Promise.all(
        elements.map(async (element) => {
          return await this.elementsService.create(
            project_id,
            element,
            scene.id,
          );
        }),
      );
    }

    return scene;
  }
}
