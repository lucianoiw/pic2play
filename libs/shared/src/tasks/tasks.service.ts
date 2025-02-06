import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

import { PrismaService } from '../prisma/prisma.service';

import { VIDEO_QUEUE } from '../constants';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue(VIDEO_QUEUE) private readonly videoQueue: Queue,
  ) {}

  private logger = new Logger(TasksService.name);

  async initializeProject(project_id: string) {
    await this.videoQueue.add('initialize_project', { project_id });
  }

  async addTask(
    { project_id, scene_id }: { project_id: string; scene_id?: string },
    job_name: string,
    data: any,
    increment: boolean = true,
  ) {
    if (increment) {
      if (scene_id) {
        await this.prisma.scene.update({
          where: { id: scene_id },
          data: { pending_tasks: { increment: 1 } },
        });
      }

      await this.prisma.project.update({
        where: { id: project_id },
        data: {
          pending_tasks: { increment: 1 },
        },
      });
    }

    await this.videoQueue.add(
      job_name,
      { ...data, project_id, scene_id },
      { priority: scene_id ? 1 : 2 },
    );
  }

  async completeTask({
    project_id,
    scene_id,
  }: {
    project_id: string;
    scene_id?: string;
  }) {
    console.log('completeTask', { project_id, scene_id });

    if (scene_id) {
      const scene = await this.prisma.scene.update({
        where: { id: scene_id },
        data: { pending_tasks: { decrement: 1 } },
      });

      if (scene.pending_tasks === 0) {
        await this.processScene({ project_id, scene_id }, { delay: 1000 });
      }
    }

    const project = await this.prisma.project.update({
      where: { id: project_id },
      data: {
        pending_tasks: { decrement: 1 },
      },
    });

    if (project.pending_tasks === 0) {
      await this.checkProject(project_id, { delay: 1500 });
    }
  }

  async checkProject(project_id: string, { delay }: { delay?: number } = {}) {
    await this.videoQueue.add('check_project', { project_id }, { delay });
  }

  async processScene(
    {
      project_id,
      scene_id,
    }: {
      project_id: string;
      scene_id: string;
    },
    { delay }: { delay?: number } = {},
  ) {
    await this.videoQueue.add(
      'process_scene',
      { project_id, scene_id },
      { delay },
    );
  }

  async processProject(project_id: string) {
    await this.videoQueue.add('process_project', { project_id });
  }

  async projectCompleted(project_id: string) {
    await this.videoQueue.add('project_completed', { project_id });
  }
}
