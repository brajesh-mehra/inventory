import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StockManagementService } from './stock-management.service';
import { StockManagementController } from './stock-management.controller';
import { StockManagement, StockManagementSchema } from '../schemas/stock-management.schema';
import { StockTransaction, StockTransactionSchema } from '../schemas/stock-transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StockManagement.name, schema: StockManagementSchema },
      { name: StockTransaction.name, schema: StockTransactionSchema },
    ]),
  ],
  controllers: [StockManagementController],
  providers: [StockManagementService],
})
export class StockManagementModule { }