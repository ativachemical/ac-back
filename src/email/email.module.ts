import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [EmailService, PrismaService],
  exports: [EmailService],
  controllers: [EmailController]
})
export class EmailModule {}
