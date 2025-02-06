import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { LoggerModule } from 'nestjs-pino';
import { CustomLogger } from './custom.logger';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        REDIS_URL: Joi.string().required(),
      }),
    }),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        url: configService.get('REDIS_URL'),
      }),
    }),

    LoggerModule.forRoot({
      pinoHttp: {
        level: 'trace',

        transport: {
          target:
            process.env.NODE_ENV !== 'production' ? 'pino-pretty' : undefined,

          options: {
            singleLine: true,
          },
        },
      },
    }),
  ],
  providers: [CustomLogger],
  exports: [BullModule, CustomLogger],
})
export class SharedModule {}
