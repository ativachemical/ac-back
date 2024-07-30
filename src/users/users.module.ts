import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';
import { APP_FILTER } from '@nestjs/core';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaClientExceptionFilter } from '../common/filters/prisma-exception.filter';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [PrismaModule],
  exports: [UsersService],
})
export class UsersModule {}

// @Module({
//   imports: [PrismaModule],
//   controllers: [UsersController],
//   providers: [
//     UsersService,
//     PrismaService,
//     {
//       provide: APP_FILTER,
//       useClass: PrismaClientExceptionFilter,
//     },
//   ],
//   exports: [UsersService],
// })
