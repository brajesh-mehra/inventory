import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsDefined, IsNumber, IsEnum, IsMongoId, IsDate } from 'class-validator';

export class CreateStockTransactionDto {
  @IsDefined({ message: 'Company name is required' })
  @IsNotEmpty({ message: 'Company name cannot be empty' })
  @IsString({ message: 'Company name must be a valid string' })
  companyName: string;

  @IsDefined({ message: 'Stock item ID is required' })
  @IsNotEmpty({ message: 'Stock item ID cannot be empty' })
  @IsMongoId({ message: 'Stock item ID must be a valid MongoDB ObjectId' })
  stockItemId: string;

  @IsDefined({ message: 'Transaction type is required' })
  @IsNotEmpty({ message: 'Transaction type cannot be empty' })
  @IsEnum(['IN', 'OUT'], { message: 'Transaction type must be either "IN" or "OUT"' })
  type: 'IN' | 'OUT';

  @IsDefined({ message: 'Quantity is required' })
  @IsNotEmpty({ message: 'Quantity cannot be empty' })
  @IsNumber({}, { message: 'Quantity must be a valid number' })
  @Type(() => Number)
  quantity: number;

  // @IsDefined({ message: 'Transaction date is required' })
  // @IsNotEmpty({ message: 'Transaction date cannot be empty' })
  // @Type(() => Date)
  // date: Date;

  @IsDefined({ message: 'Invoice file is required' })
  @IsNotEmpty({ message: 'Invoice file cannot be empty' })
  @IsString({ message: 'Invoice file must be a base64 encoded string or file reference' })
  invoiceFile: string;
}