import { BadRequestException, Controller, NotFoundException } from '@nestjs/common';
import { StockManagementService } from './stock-management.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateStockItemDto } from './dto/create-stock-item.dto';
import { UpdateStockItemDto } from './dto/update-stock-item.dto';
import { isValidObjectId } from 'mongoose';
import * as xlsx from 'xlsx';
import { CreateStockTransactionDto } from './dto/create-stock-transaction.dto';
import { UpdateStockTransactionDto } from './dto/update-stock-transaction.dto';


@Controller('stock-management')
export class StockManagementController {
    constructor(private readonly stockManagementService: StockManagementService) { }

    @MessagePattern('createStockItem')
    async createStockItem(@Payload() dto: CreateStockItemDto) {
        return this.stockManagementService.createStockItem(dto);
    }

    @MessagePattern('getAllStockItems')
    async getAllStockItems(@Payload() filters: any) {
        return this.stockManagementService.getAllStockItems(filters);
    }

    @MessagePattern('getDashboardStatistics')
    async getDashboardStatistics() {
        return this.stockManagementService.getDashboardStatistics();
    }

    @MessagePattern('getStockById')
    async getStockById(@Payload() { id }: { id: string }) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid stock item ID');
        const stock = await this.stockManagementService.getStockById(id);
        if (!stock) throw new NotFoundException('Stock item not found');
        return stock;
    }

    @MessagePattern('updateStockItem')
    async updateStockItem(@Payload() { id, ...updateDto }: { id: string } & UpdateStockItemDto) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid stock item ID');
        const updated = await this.stockManagementService.updateStockItem(id, updateDto);
        if (!updated) throw new NotFoundException('Stock item not found');
        return updated;
    }

    @MessagePattern('deleteStockItem')
    async deleteStockItem(@Payload() { id }: { id: string }) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid stock item ID');
        return this.stockManagementService.deleteStockItem(id);
    }

    // 🔹 Stock Transactions
    @MessagePattern('createStockTransaction')
    async createStockTransaction(
        @Payload() createStockDto: CreateStockTransactionDto,
    ) {
        if (!isValidObjectId(createStockDto.stockItemId)) throw new BadRequestException('Invalid stock item ID');
        return this.stockManagementService.createStockTransaction(createStockDto.stockItemId, createStockDto);
    }

    @MessagePattern('updateStockTransaction')
    async updateStockTransaction(
        @Payload() { id, ...updateStockDto }: { id: string } & UpdateStockTransactionDto,
    ) {
        if (!isValidObjectId(id)) throw new BadRequestException('Invalid transaction ID');
        return this.stockManagementService.updateStockTransaction(id, updateStockDto);
    }

    @MessagePattern('getTransactionsByStock')
    async getTransactionsByStock(@Payload() payload: { stockItemId: string; companyName?: string }) {
        const { stockItemId, companyName } = payload;

        if (!isValidObjectId(stockItemId)) throw new BadRequestException('Invalid stock item ID');
        return this.stockManagementService.getTransactionsByStock(stockItemId, companyName);
    }

    // 🔹 Upload Stock Items from Excel

    @MessagePattern('uploadStockExcel')
    async uploadStockExcel(@Payload() { file }: { file: string }) {
        try {
            const buffer = Buffer.from(file, 'base64');
            const workbook = xlsx.read(buffer, { type: 'buffer' });
            const sheet = workbook.SheetNames[0];
            const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);

            if (!rows.length) throw new BadRequestException('Excel file is empty');

            return await this.stockManagementService.bulkImportStockItems(rows);
        } catch (err) {
            throw new BadRequestException('Invalid Excel file format or content');
        }
    }
}