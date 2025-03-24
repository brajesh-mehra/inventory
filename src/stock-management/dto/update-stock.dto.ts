import { PartialType } from '@nestjs/mapped-types';
import { CreateStockDto } from './create-stock.dto';
import { IsString, IsEmail, IsBoolean, IsArray, IsOptional, MinLength, ArrayNotEmpty, IsNotEmpty, IsDefined } from 'class-validator';

export class UpdateStockDto extends PartialType(CreateStockDto) {
}
