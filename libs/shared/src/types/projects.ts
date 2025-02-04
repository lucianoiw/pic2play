import { ProjectQualityEnum, ProjectStatusEnum } from '@prisma/client';

import { CreateSceneProps } from './scenes';
import { CreateElementProps } from './elements';

export interface ProjectProps {
  id: string;

  description?: string;
  resolution?: string;
  quality: ProjectQualityEnum;
  status: ProjectStatusEnum;

  pending_tasks?: number;
}

export interface CreateProjectProps extends Omit<ProjectProps, 'id'> {
  scenes?: CreateSceneProps[];
  elements?: CreateElementProps[];
}
