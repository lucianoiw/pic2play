import { Body, Controller, Post } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { ProjectsService } from '../projects/projects.service';
import { CreateProjectProps } from '../../../../libs/shared/src/types/projects';
import { ScenesService } from '../scenes/scenes.service';
import { ElementsService } from '../elements/elements.service';
import { VIDEO_QUEUE } from '@app/shared';

@Controller('videos')
export class VideosController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly scenesService: ScenesService,
    private readonly elementsService: ElementsService,

    @InjectQueue(VIDEO_QUEUE) private readonly videoQueue: Queue,
  ) {}

  @Post()
  async create(@Body() { scenes, elements, ...project }: CreateProjectProps) {
    const createdProject = await this.projectsService.create(project);

    await Promise.all(
      scenes.map(async ({ elements, ...scene }) => {
        const createdScene = await this.scenesService.create(
          createdProject.id,
          scene,
        );

        await this.videoQueue.add(createdScene);

        if (elements?.length) {
          await Promise.all(
            elements.map(async (element) => {
              const createdElement = await this.elementsService.create(
                createdProject.id,
                element,
                createdScene.id,
              );

              return createdElement;
            }),
          );
        }

        return createdScene;
      }),
    );

    if (elements?.length) {
      await Promise.all(
        elements.map(async (element) => {
          return await this.elementsService.create(createdProject.id, element);
        }),
      );
    }

    return this.projectsService.findOne(createdProject.id);
  }
}
