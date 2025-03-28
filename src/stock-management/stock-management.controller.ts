import { BadRequestException, Controller, NotFoundException } from '@nestjs/common';
import { StockManagementService } from './stock-management.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { isValidObjectId } from 'mongoose';
import * as xlsx from 'xlsx';


@Controller('stock-management')
export class StockManagementController {
    constructor(private readonly stockManagementService: StockManagementService) { }

    @MessagePattern('getAllStocks')
    async getAllStocks(@Payload() filters: any) {
        return this.stockManagementService.findAll(filters);
    }

    @MessagePattern('getStock')
    async getStock(@Payload() { id }: { id: string }) {
        if (!isValidObjectId(id)) {
            throw new BadRequestException(`Invalid stock ID.`);
        }

        const stock = await this.stockManagementService.findOne(id);
        if (!stock) {
            throw new NotFoundException(`No stock found with the given ID.`);
        }

        return stock;
    }

    @MessagePattern('createStock')
    async createStock(@Payload() createStockDto: CreateStockDto) {
        return this.stockManagementService.create(createStockDto);
    }

    @MessagePattern('updateStock')
    async updateStock(@Payload() { id, ...updateStockDto }: { id: string } & UpdateStockDto) {
        if (!isValidObjectId(id)) {
            throw new BadRequestException(`Invalid stock ID.`);
        }

        const updatedStock = await this.stockManagementService.update(id, updateStockDto);

        if (!updatedStock) {
            throw new NotFoundException('Stock not found.');
        }

        return updatedStock;
    }

    @MessagePattern('deleteStock')
    async deleteStock(@Payload() { id }: { id: string }) {
        if (!isValidObjectId(id)) {
            throw new BadRequestException('Invalid stock ID format.');
        }
        return await this.stockManagementService.remove(id);
    }

    @MessagePattern('uploadStockExcel')
    async uploadStockExcel(payload: { file: string }) {
        try {
            const fileBuffer = Buffer.from(payload.file, 'base64');
            const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
                
            if (!sheetData.length) {
                throw new BadRequestException('Excel file is empty');
            }

            return await this.stockManagementService.saveStockExcelData(sheetData);

        } catch (error) {
            throw new BadRequestException('Invalid Excel file');
        }
    }
}