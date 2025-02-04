import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { VIDEO_QUEUE } from '../constants';

import { TasksService } from './tasks.service';

@Module({
  imports: [BullModule.registerQueue({ name: VIDEO_QUEUE })],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
