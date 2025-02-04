import { ElementStatusEnum, ElementTypeEnum } from '@prisma/client';

export interface ElementProps {
  id: string;

  description?: string;

  status: ElementStatusEnum;
  type: ElementTypeEnum;

  source_url?: string;
  duration?: number;
}

export type CreateElementProps = Omit<ElementProps, 'id'>;
