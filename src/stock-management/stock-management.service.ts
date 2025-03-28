import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { StockManagement } from '../schemas/stock-management.schema';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Injectable()
export class StockManagementService {
  constructor(
    @InjectModel(StockManagement.name) private stockManagementModel: Model<StockManagement>
  ) { }

  async create(createStockDto: CreateStockDto): Promise<StockManagement> {
    const stock = new this.stockManagementModel(createStockDto);
    return stock.save();
  }

  async findAll(filters: any): Promise<StockManagement[]> {
    const query: any = {};
    if (filters.cpName) {
      query.cpName = { $regex: filters.cpName, $options: 'i' };
    }
    if (filters.itemName) {
      query.itemName = { $regex: filters.itemName, $options: 'i' };
    }
    query.isDeleted = { $ne: true };
    const sortOptions: { [key: string]: SortOrder } = { createdAt: -1 };

    return this.stockManagementModel.find(query).sort(sortOptions).exec();
  }

  async findOne(id: string): Promise<StockManagement | null> {
    return this.stockManagementModel.findById(id).exec();
  }

  async update(id: string, updateStockDto: UpdateStockDto): Promise<StockManagement | null> {
    if (!updateStockDto) {
      throw new BadRequestException('Update data is required');
    }
    return this.stockManagementModel.findByIdAndUpdate(id, updateStockDto, { new: true }).exec();
  }

  // async remove(id: string): Promise<{ message: string }> {
  //   await this.stockManagementModel.findByIdAndDelete(id).exec();
  //   return { message: 'Stock deleted successfully' };
  // }

  async remove(id: string): Promise<{ message: string }> {
    const stock = await this.stockManagementModel.findByIdAndUpdate(id, { isActive: false, isDeleted: true }, { new: true }).exec();

    if (!stock) {
      throw new NotFoundException('Stock not found');
    }

    return { message: 'Stock deleted successfully' };
  }

  async saveStockExcelData(sheetData: any[]): Promise<{ message: string; count: number }> {
    if (!sheetData || sheetData.length === 0) {
      throw new BadRequestException('Excel file contains no data');
    }

    const stockData = sheetData.map(row => {
      return {
        cpName: row.cpName,
        itemName: row.itemName,
        itemCode: row.itemCode,
        unit: row.unit,
        quantity: row.quantity,
      } as CreateStockDto;
    });

    const result = await this.stockManagementModel.insertMany(stockData);
    return { message: 'Stock data saved successfully', count: result.length };
  }
}
