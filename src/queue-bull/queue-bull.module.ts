import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueBullService } from './queue-bull.service';
import { QueueBullProcessor } from './queue-bull.processor';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'generate-pdf-email',
    }),
    forwardRef(() => ProductModule) 
  ],
  providers: [QueueBullService, QueueBullProcessor],
  exports: [QueueBullService],
})
export class QueueBullModule {}
