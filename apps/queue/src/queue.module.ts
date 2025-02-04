import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import {
  PrismaModule,
  PrismaService,
  SharedModule,
  TasksModule,
  VIDEO_QUEUE,
} from '@app/shared';

import { VideoProcessor } from './videos/videos.processor';

@Module({
  imports: [
    SharedModule,
    PrismaModule,
    TasksModule,

    BullModule.registerQueue({ name: VIDEO_QUEUE }),
  ],
  providers: [VideoProcessor, PrismaService],
})
export class QueueModule {}
