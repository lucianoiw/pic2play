import { Module } from '@nestjs/common';

import { PrismaModule, SharedModule } from '@app/shared';

import { ProjectsModule } from './projects/projects.module';
import { ScenesModule } from './scenes/scenes.module';
import { ElementsModule } from './elements/elements.module';
import { VideosModule } from './videos/videos.module';

@Module({
  imports: [
    PrismaModule,
    SharedModule,

    ProjectsModule,
    ScenesModule,
    ElementsModule,
    VideosModule,
  ],
})
export class AppModule {}
