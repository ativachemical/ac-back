import { Test, TestingModule } from '@nestjs/testing';
import { QueueBullService } from './queue-bull.service';

describe('QueueBullService', () => {
  let service: QueueBullService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueueBullService],
    }).compile();

    service = module.get<QueueBullService>(QueueBullService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
