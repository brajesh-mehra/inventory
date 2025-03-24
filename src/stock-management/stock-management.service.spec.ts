import { Test, TestingModule } from '@nestjs/testing';
import { StockManagementService } from './stock-management.service';

describe('StockManagementService', () => {
  let service: StockManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockManagementService],
    }).compile();

    service = module.get<StockManagementService>(StockManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
