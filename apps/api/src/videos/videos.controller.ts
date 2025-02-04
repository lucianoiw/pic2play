import { Body, Controller, Post } from '@nestjs/common';

import { TasksService } from '@app/shared';
import { CreateProjectProps } from '@app/shared/types';

import { ProjectsService } from '../projects/projects.service';
import { ScenesService } from '../scenes/scenes.service';
import { ElementsService } from '../elements/elements.service';

@Controller('videos')
export class VideosController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly scenesService: ScenesService,
    private readonly elementsService: ElementsService,

    private readonly tasksService: TasksService,
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

        // await this.videoQueue.add(createdScene);

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
          const createdElement = await this.elementsService.create(
            createdProject.id,
            element,
          );

          return createdElement;
        }),
      );
    }

    await this.tasksService.addProjectTask(createdProject.id);

    return this.projectsService.findOne(createdProject.id);
  }
}
