import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

import {
  ElementProps,
  PrismaService,
  TasksService,
  VIDEO_QUEUE,
} from '@app/shared';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Processor(VIDEO_QUEUE)
export class VideoProcessor {
  private logger = new Logger(VideoProcessor.name);

  constructor(
    private prisma: PrismaService,
    private readonly tasksService: TasksService,
  ) {}

  @Process('initialize_project')
  async handleInitializeProject(job: Job<{ project_id: string }>) {
    const { project_id } = job.data;

    this.logger.verbose(`Iniciado processamento do projeto ${project_id}`);

    const { scenes, elements } = await this.prisma.project.findUnique({
      where: { id: project_id },
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

    const all_scenes: { scene_id: string; elements_count: number }[] = [];
    const all_elements = [];

    scenes?.forEach(({ elements: scene_elements, ...scene }) => {
      // Adiciona a cena à lista de cenas
      all_scenes.push({
        scene_id: scene.id,
        elements_count: scene_elements.length,
      });

      // Adiciona os elementos da cena à lista de elementos
      scene_elements?.forEach((element) => {
        all_elements.push(element);
      });
    });

    // Adiciona os elementos que não estão associados a nenhuma cena à lista de elementos
    elements?.forEach((element) => {
      all_elements.push(element);
    });

    // Atualiza as quantidades de tarefas na cena
    await Promise.all(
      all_scenes.map(async ({ scene_id, elements_count }) =>
        this.prisma.scene.update({
          where: { id: scene_id },
          data: { pending_tasks: elements_count },
        }),
      ),
    );

    // Adiciona as quantidades de tarefas e cenas no projeto
    // await this.prisma.project.update({
    //   where: { id: project_id },
    //   data: {
    //     pending_tasks: all_elements.length,
    //     pending_scenes_tasks: all_scenes.length,
    //   },
    // });

    // Adiciona os elementos à fila de processamento
    await Promise.all(
      all_elements.map(async (element) => {
        await this.tasksService.addTask(
          { project_id, scene_id: element.scene_id },
          'process_element',
          element,
          false,
        );
      }),
    );
  }

  @Process('process_element')
  async handleProcessElement(job: Job<ElementProps>) {
    const { id: element_id, project_id, scene_id } = job.data;

    const seconds = (Math.floor(Math.random() * 10) + 1) * 1000;

    // Processa o elemento
    await sleep(seconds);

    this.logger.verbose(
      `Processado elemento ${element_id}${scene_id ? ` da cena ${scene_id}` : ''} do projeto ${project_id}. ${seconds}ms`,
    );

    await this.tasksService.completeTask({ project_id, scene_id });
  }

  @Process('process_scene')
  async handleProcessScene(job: Job<{ project_id: string; scene_id: string }>) {
    const { project_id, scene_id } = job.data;

    // Marcar a cena como processando
    const scene = await this.prisma.scene.update({
      where: { id: scene_id, project: { id: project_id }, status: 'pending' },
      data: { status: 'processing' },
    });

    if (scene && scene.pending_tasks === 0) {
      const seconds = (Math.floor(Math.random() * 50) + 1) * 1000;

      // Processa a cena
      await sleep(seconds);

      // Marcar a cena como concluída
      await this.prisma.scene.update({
        where: { id: scene.id },
        data: { status: 'completed' },
      });

      this.logger.verbose(
        `Processada cena ${scene_id} do projeto ${project_id}. ${seconds}ms`,
      );

      // Decrementar a quantidade de cenas pendentes do projeto
      const project = await this.prisma.project.update({
        where: { id: project_id },
        data: {
          pending_scenes_tasks: { decrement: 1 },
        },
      });

      // Verificar se todas as cenas foram processadas
      if (project.pending_scenes_tasks === 0) {
        // Se todas as cenas foram processadas, verifica se todas as tarefas do projeto foram concluídas
        await this.tasksService.checkProject(project_id);
      }
    }
  }

  @Process('check_project')
  async handleCheckProject(job: Job<{ project_id: string }>) {
    const { project_id } = job.data;

    const project = await this.prisma.project.findUnique({
      where: { id: project_id, status: 'pending' },
    });

    if (!project) {
      this.logger.warn(
        `Projeto ${project_id} não encontrado ou já está sendo processado.`,
      );

      return;
    }

    if (project.pending_tasks === 0 && project.pending_scenes_tasks === 0) {
      await this.prisma.project.update({
        where: { id: project_id, status: 'pending' },
        data: {
          status: 'processing',
        },
      });

      await this.tasksService.processProject(project_id);
    } else {
      this.logger.warn(
        project.pending_scenes_tasks
          ? project.pending_scenes_tasks === 1
            ? `Ainda existe uma cena pendente no projeto ${project_id}`
            : `Ainda existem ${project.pending_scenes_tasks} cenas pendentes no projeto ${project_id}.`
          : project.pending_tasks === 1
            ? `Ainda existe uma tarefa pendente no projeto ${project_id}`
            : `Ainda existem ${project.pending_tasks} tarefas pendentes no projeto ${project_id}.`,
      );
    }
  }

  @Process('process_project')
  async handleProcessProject(job: Job<{ project_id: string }>) {
    const { project_id } = job.data;

    const project = await this.prisma.project.findUnique({
      where: { id: project_id, status: 'processing' },
    });

    if (!project) {
      this.logger.warn(
        `Projeto ${project_id} não encontrado ou já foi processado.`,
      );

      return;
    }

    const seconds = (Math.floor(Math.random() * 10) + 1) * 1000;

    // Processa o vídeo
    await sleep(seconds);

    await this.prisma.project.update({
      where: { id: project_id, status: 'processing' },
      data: {
        status: 'completed',
      },
    });

    this.logger.verbose(`O vídeo do projeto ${project_id} foi processado.`);

    await this.tasksService.projectCompleted(project_id);
  }

  @Process('project_completed')
  async handleProjectCompleted(job: Job<{ project_id: string }>) {
    const { project_id } = job.data;

    const seconds = (Math.floor(Math.random() * 10) + 1) * 1000;

    // Enviando notificação de projeto finalizado
    await sleep(seconds);

    this.logger.verbose(`O projeto ${project_id} foi finalizado.`);
  }
}
