import { Module } from '@nestjs/common';
import { StockManagementController } from './stock-management.controller';
import { StockManagementService } from './stock-management.service';
import { MongooseModule } from '@nestjs/mongoose';
import { StockManagement, StockManagementSchema } from '../schemas/stock-management.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: StockManagement.name, schema: StockManagementSchema }]),
  ],
  controllers: [StockManagementController],
  providers: [StockManagementService]
})
export class StockManagementModule {}
