import { ProjectQualityEnum, ProjectStatusEnum } from '@prisma/client';

import { CreateSceneProps } from '../scenes/scenes.types';
import { CreateElementProps } from '../elements/elements.types';

export interface ProjectProps {
  id: string;

  description?: string;
  resolution?: string;
  quality: ProjectQualityEnum;
  status: ProjectStatusEnum;
}

export interface CreateProjectProps extends Omit<ProjectProps, 'id'> {
  scenes?: CreateSceneProps[];
  elements?: CreateElementProps[];
}
