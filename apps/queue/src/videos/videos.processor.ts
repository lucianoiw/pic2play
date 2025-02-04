import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

import { PrismaService, TasksService, VIDEO_QUEUE } from '@app/shared';

@Processor(VIDEO_QUEUE)
export class VideoProcessor {
  private logger = new Logger(VideoProcessor.name);

  constructor(
    private prisma: PrismaService,
    private readonly tasksService: TasksService,
  ) {}

  @Process('process_project')
  async handleProcess(job: Job<{ project_id: string }>) {
    this.logger.debug(`Processando projeto: ${job.data.project_id}`);

    const project = await this.prisma.project.findUnique({
      where: { id: job.data.project_id },
      include: {
        scenes: {
          include: {
            elements: true,
          },
        },
        elements: {
          where: { scene_id: null },
        },
      },
    });

    if (project?.scenes?.length) {
      await Promise.all(
        project.scenes.map(async (scene) => {
          if (scene.elements.length) {
            await Promise.all(
              scene.elements.map(async (element) => {
                await this.tasksService.addTask(
                  job.data.project_id,
                  'process_element',
                  {
                    scene_id: scene.id,
                    element_id: element.id,
                  },
                );
              }),
            );
          }

          await this.tasksService.addTask(
            job.data.project_id,
            'process_scene',
            {
              scene_id: scene.id,
            },
          );
        }),
      );
    }

    if (project?.elements?.length) {
      await Promise.all(
        project.elements.map(async (element) => {
          await this.tasksService.addTask(
            job.data.project_id,
            'process_element',
            {
              element_id: element.id,
            },
          );
        }),
      );
    }
  }

  @Process('process_element')
  async handleProcessElement(
    job: Job<{ project_id: string; element_id: string }>,
  ) {
    this.logger.debug(`Processando elemento: ${JSON.stringify(job.data)}`);
    await this.tasksService.completeTask(job.data.project_id);
  }

  @Process('process_scene')
  async handleProcessScene(job: Job<{ project_id: string; scene_id: string }>) {
    this.logger.debug(`Processando cena: ${JSON.stringify(job.data)}`);
    await this.tasksService.completeTask(job.data.project_id);
  }

  @Process('merge_video')
  async handleMergeVideo(job: Job<{ project_id: string }>) {
    this.logger.debug(`Mergeando video: ${job.data.project_id}`);
  }

  @Process('check_merge_status')
  async handleCheckMergeStatus(job: Job<{ project_id: string }>) {
    const { project_id } = job.data;

    this.logger.debug(`🔍 Verificando status do projeto ${project_id}`);

    const project = await this.prisma.project.findUnique({
      where: { id: project_id },
    });

    if (project.pending_tasks === 0) {
      this.logger.debug(
        `🚀 Todas as tarefas finalizadas, iniciando merge para o projeto ${project_id}.`,
      );

      await this.tasksService.addTask(project_id, 'merge_video', {
        project_id,
      });
    } else {
      this.logger.debug(
        `⏳ Ainda existem ${project.pending_tasks} tarefas pendentes no projeto ${project_id}.`,
      );
    }
  }
}
