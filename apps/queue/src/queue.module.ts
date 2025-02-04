import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { SharedModule, VIDEO_QUEUE } from '@app/shared';

import { VideoProcessor } from './videos/videos.processor';

@Module({
  imports: [SharedModule, BullModule.registerQueue({ name: VIDEO_QUEUE })],
  providers: [VideoProcessor],
})
export class QueueModule {}
