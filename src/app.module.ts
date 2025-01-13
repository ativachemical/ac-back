import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { EmailModule } from './email/email.module';
import { FileManagerModule } from './file-manager/file-manager.module';
import { BullModule } from '@nestjs/bull';
import { QueueBullModule } from './queue-bull/queue-bull.module';
import Redis from 'ioredis';

@Module({
  imports: [
    PrismaModule,
    ProductModule,
    UsersModule,
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'node_modules', 'swagger-ui-dist'),
      serveRoot: '/swagger',
    }),
    EmailModule,
    FileManagerModule,
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: process.env.REDIS_QUEUE,
      }),
    }),
    BullModule.registerQueue({
      name: 'generate-pdf-email', // Nome da fila
    }),
    QueueBullModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
