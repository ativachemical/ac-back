import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaService } from '../prisma/prisma.service';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { EmailService } from '../email/email.service';
import { FileManagerService } from '../file-manager/file-manager.service';

@Module({
  imports: [
    MulterModule.register({
      storage: multer.memoryStorage(), // diretório onde os arquivos serão armazenados temporariamente
    }),
  ],
  controllers: [ProductController],
  providers: [ProductService, PrismaService, EmailService, FileManagerService],
})
export class ProductModule {}
