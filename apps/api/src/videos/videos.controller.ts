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
    const { description, resolution, quality } = project;

    const pending_tasks =
      elements.length +
      scenes.reduce((p, s) => {
        return p + s.elements.length;
      }, 0);

    // Inserir um novo projeto no banco de dados
    const createdProject = await this.projectsService.create({
      description,
      resolution,
      quality,
      pending_tasks,
      pending_scenes_tasks: scenes.length,
    });

    // Inserir as cenas do projeto e os elementos de cada cena
    await Promise.all(
      scenes.map(async (scene) =>
        this.scenesService.create(createdProject.id, scene),
      ),
    );

    // Inserir os elementos que não estão associados a nenhuma cena
    if (elements?.length) {
      await Promise.all(
        elements.map(async (element) =>
          this.elementsService.create(createdProject.id, element),
        ),
      );
    }

    // Manda iniciar o processamento do projeto
    await this.tasksService.initializeProject(createdProject.id);

    return {
      data: createdProject.id,
    };
  }
}
