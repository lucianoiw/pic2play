import { SceneStatusEnum } from '@prisma/client';

import { CreateElementProps } from './elements';

export interface SceneProps {
  id: string;

  description?: string;

  duration: number;
  status: SceneStatusEnum;
}

export interface CreateSceneProps extends Omit<SceneProps, 'id'> {
  elements?: CreateElementProps[];
}
