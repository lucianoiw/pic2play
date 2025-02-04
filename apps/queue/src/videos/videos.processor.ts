import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

import { VIDEO_QUEUE } from '@app/shared';

@Processor(VIDEO_QUEUE)
export class VideoProcessor {
  private logger = new Logger(VideoProcessor.name);

  @Process()
  async handleProcessScene(job: Job<unknown>) {
    this.logger.debug(job.data);
  }
}
