import { ElementStatusEnum, ElementTypeEnum } from '@prisma/client';
import { ProjectProps } from './projects';
import { SceneProps } from './scenes';

export interface ElementProps {
  id: string;

  description?: string;

  status?: ElementStatusEnum;
  type: ElementTypeEnum;

  source_url?: string;
  duration?: number;

  created_at: Date;
  updated_at: Date;

  project: ProjectProps;
  project_id: string;

  scene?: SceneProps;
  scene_id?: string;
}

export type CreateElementProps = Omit<ElementProps, 'id'>;
