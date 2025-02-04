import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';

import { PrismaService } from '../prisma/prisma.service';

import { VIDEO_QUEUE } from '../constants';
import { ElementProps } from '../types';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue(VIDEO_QUEUE) private readonly videoQueue: Queue,
  ) {}

  private logger = new Logger(TasksService.name);

  async addProjectTask(project_id: string) {
    await this.videoQueue.add('process_project', { project_id });
  }

  async addDownloadImageTask(element: ElementProps) {
    await this.videoQueue.add('download_image', element);
  }

  async addDownloadAudioTask(element: ElementProps) {
    await this.videoQueue.add('download_audio', element);
  }

  async addTask(project_id: string, job_name: string, data: any) {
    await this.prisma.$transaction(async (tx) => {
      await tx.project.update({
        where: { id: project_id },
        data: { pending_tasks: { increment: 1 } },
      });

      await this.videoQueue.add(job_name, { ...data, project_id });

      this.logger.debug(
        `Tarefa adicionads: ${job_name} para o projeto ${project_id} dados ${JSON.stringify(data)}`,
      );
    });
  }

  async completeTask(project_id: string) {
    await this.prisma.$transaction(async (tx) => {
      const project = await tx.project.update({
        where: { id: project_id },
        data: { pending_tasks: { decrement: 1 } },
      });

      this.logger.debug(
        `Projeto: ${project_id} ${project.pending_tasks} tarefas restantes.`,
      );

      if (project.pending_tasks === 0) {
        this.logger.debug(
          `Todas as tarefas concluídas para o projeto ${project_id}. Iniciando merge do vídeo.`,
        );

        await this.videoQueue.add(
          'check_merge_status',
          { project_id },
          { delay: 1000 },
        );
      }
    });
  }
}
