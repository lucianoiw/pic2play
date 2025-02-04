import { Body, Controller, Post } from '@nestjs/common';

import { ProjectsService } from '../projects/projects.service';
import { CreateProjectProps } from '../projects/projects.types';
import { ScenesService } from '../scenes/scenes.service';
import { ElementsService } from '../elements/elements.service';

@Controller('videos')
export class VideosController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly scenesService: ScenesService,
    private readonly elementsService: ElementsService,
  ) {}

  @Post()
  async create(@Body() { scenes, elements, ...project }: CreateProjectProps) {
    const createdProject = await this.projectsService.create(project);

    await Promise.all(
      scenes.map(async (scene) => {
        return this.scenesService.create(createdProject.id, scene);
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
