import { forwardRef, Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaService } from '../prisma/prisma.service';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { EmailService } from '../email/email.service';
import { FileManagerService } from '../file-manager/file-manager.service';
import { QueueBullService } from '../queue-bull/queue-bull.service';
import { QueueBullModule } from '../queue-bull/queue-bull.module';
import { BullModule } from '@nestjs/bull';
import { RecaptchaModule } from '../recaptcha/recaptcha.module';

@Module({
  imports: [
    MulterModule.register({
      storage: multer.memoryStorage(), // diretório onde os arquivos serão armazenados temporariamente
    }),
    BullModule.registerQueue({
      name: 'generate-pdf-email',
    }),
    forwardRef(() => QueueBullModule),
    RecaptchaModule
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
    PrismaService,
    EmailService,
    FileManagerService,
    QueueBullService,
    // QueueBullProcessor
  ],
  exports: [ProductService],
})
export class ProductModule { }
