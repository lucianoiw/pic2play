import { Module } from '@nestjs/common';

import { SharedModule } from '@app/shared';

import { PrismaService } from './prisma.service';
import { VideosModule } from './videos/videos.module';
import { ProjectsModule } from './projects/projects.module';
import { ScenesModule } from './scenes/scenes.module';
import { ElementsModule } from './elements/elements.module';

@Module({
  imports: [
    SharedModule,

    VideosModule,
    ProjectsModule,
    ScenesModule,
    ElementsModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
